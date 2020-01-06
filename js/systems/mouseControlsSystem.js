
const {config} = require('../config');
const {
  collidesWith,
  getSelectedAntIDs,
  getEntitiesByType,
} = require('../selectors/selectors');
const {canvasToGrid, gridToCanvas} = require('../utils/canvasHelpers');
const {add, subtract} = require('../utils/vectors');
const {makeLocation} = require('../entities/location');
const {createGoToLocationTask} = require('../state/tasks');

const initMouseControlsSystem = (store) => {
  const {dispatch} = store;

  let canvas = null;
  document.onmouseup = (ev) => {
    const state = store.getState();
    // TODO: maybe a better way to get the canvas
    if (!canvas) {
      canvas = document.getElementById('canvas');
      // don't open the normal right-click menu
      canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
      if (!canvas) {
        return;
      }
    }
    const rect = canvas.getBoundingClientRect();

    const canvasPos = {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    };
    const gridPos = canvasToGrid(canvasPos);

    if (ev.button == 0) { // left click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false});
      handleLeftClick(state, dispatch, gridPos, false /* isMouseDown */);
    } else if (ev.button == 2) { // right click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false});
      handleRightClick(state, dispatch, gridPos);
    }
  }

  document.onmousedown = (ev) => {
    const state = store.getState();
    // TODO: maybe a better way to get the canvas
    if (!canvas) {
      canvas = document.getElementById('canvas');
      // don't open the normal right-click menu
      canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
      if (!canvas) {
        return;
      }
    }
    const rect = canvas.getBoundingClientRect();

    const canvasPos = {
      x: ev.clientX - rect.left,
      y: ev.clientY - rect.top,
    };
    const gridPos = canvasToGrid(canvasPos);

    if (ev.button == 0) { // left click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: true});
      if (state.game.userMode === 'CREATE_LOCATION') {
        dispatch({type: 'START_CREATE_LOCATION', position: gridPos});
      }
    } else if (ev.button == 2) { // right click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: true});

    }
  }

  document.onmousemove = (ev) => {
    const state = store.getState();
    if (state.game.mouse.isLeftDown && state.game.userMode === 'MARK') {
      // TODO: maybe a better way to get the canvas
      if (!canvas) {
        canvas = document.getElementById('canvas');
        // don't open the normal right-click menu
        canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
        if (!canvas) {
          return;
        }
      }
      const rect = canvas.getBoundingClientRect();

      const canvasPos = {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top,
      };
      const gridPos = canvasToGrid(canvasPos);
      const clickedEntities = collidesWith(
        {position: gridPos, width: 1, height: 1},
        getEntitiesByType(state.game, 'DIRT'),
      );
      for (const clickedEntity of clickedEntities) {
        dispatch({
          type: 'MARK_ENTITY',
          entityID: clickedEntity.id,
          quantity: 1,
        });
      }
    }
  }

};

const handleLeftClick = (
  state: State,
  dispatch: Dispatch,
  gridPos: Vector,
): void => {
  // handle creating locations
  if (state.game.userMode === 'CREATE_LOCATION') {
    const dimensions = subtract(gridPos, state.game.tempLocation);
    const locPosition = {...state.game.tempLocation};
    if (dimensions.x < 0) {
      locPosition.x = locPosition.x + dimensions.x;
    }
    if (dimensions.y < 0) {
      locPosition.y = locPosition.y + dimensions.y;
    }
    const newLocation = makeLocation(
      'test', // TODO
      Math.abs(dimensions.x) + 1, // off by one
      Math.abs(dimensions.y) + 1,
      locPosition,
    );
    dispatch({type: 'CREATE_ENTITY', entity: newLocation});
    return;
  }

  // handle selecting ants
  const clickedAnts = collidesWith(
    {position: gridPos, width: 1, height: 1},
    getEntitiesByType(state.game, 'ANT'),
  );
  // TODO: support multi-selection via marquee
  if (clickedAnts.length > 0) {
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: clickedAnts.map(entity => entity.id),
    });
  } else if (state.game.selectedEntities.length > 0) {
    dispatch({
      type: 'SET_SELECTED_ENTITIES',
      entityIDs: [],
    });
  }
};

const handleRightClick = (state: State, dispatch: Dispatch, gridPos: Vector): void => {
  const selectedAntIDs = getSelectedAntIDs(state.game);
  const clickedEntities = collidesWith(
    {position: gridPos, width: 1, height: 1},
    getEntitiesByType(state.game, 'DIRT'),
  );
  const clickedEntity = clickedEntities[0];
  const clickedFood = collidesWith(
    {position: gridPos, width: 1, height: 1},
    getEntitiesByType(state.game, 'FOOD'),
  )[0];
  // TODO add config for which entities can be picked up
  const blocked = clickedEntity != null || clickedFood != null;

  const clickedLocation = {
    id: -1,
    name: 'Clicked Position',
    position: blocked ? add(gridPos, {x: -1, y: -1}) : gridPos,
    width: blocked ? 3 : 1,
    height: blocked ? 3 : 1,
  };
  if (selectedAntIDs.length > 0) {
    const task = createGoToLocationTask(clickedLocation);
    const eatClicked = {
      type: 'DO_ACTION',
      action: {
        type: 'EAT',
        payload: {
          object: clickedFood,
        },
      },
    };
    const pickupClicked = {
      type: 'DO_ACTION',
      action: {
        type: 'PICKUP',
        payload: {
          object: clickedEntity,
        },
      },
    };
    const putdownClicked = {
      type: 'DO_ACTION',
      action: {
        type: 'PUTDOWN',
        payload: {
          object: {position: gridPos},
        },
      },
    };
    if (clickedFood != null) {
      task.behaviorQueue.push(eatClicked);
    } else {
      task.behaviorQueue.push({
        type: 'CONDITIONAL',
        condition: {
          type: 'HOLDING',
          comparator: 'EQUALS',
          payload: {
            object: 'NOTHING',
          },
        },
        behavior: pickupClicked,
        elseBehavior: putdownClicked,
      });
    }
    dispatch({
      type: 'ASSIGN_TASK',
      ants: selectedAntIDs,
      task,
    });
  }
};

module.exports = {initMouseControlsSystem};
