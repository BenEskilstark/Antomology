
const {config} = require('../config');
const {
  collidesWith,
  getSelectedAntIDs,
  getEntitiesByType,
} = require('../selectors/selectors');
const {canvasToGrid, gridToCanvas} = require('../utils/canvasHelpers');
const {add, subtract} = require('../utils/vectors');
const {makeLocation} = require('../entities/location');
const {
  createGoToLocationTask,
  createDoAction,
} = require('../state/tasks');

const initMouseControlsSystem = (store) => {
  const {dispatch} = store;

  let canvas = null;
  document.onmouseup = (ev) => {
    const state = store.getState();
    const gridPos = getClickedPos(ev);
    if (gridPos == null) return;

    if (ev.button == 0) { // left click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: false});
      handleLeftClick(state, dispatch, gridPos);
    } else if (ev.button == 2) { // right click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: false});
      handleRightClick(state, dispatch, gridPos);
    }
  }

  document.onmousedown = (ev) => {
    const state = store.getState();
    const gridPos = getClickedPos(ev);
    if (gridPos == null) return;

    if (ev.button == 0) { // left click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: true, isDown: true, downPos: gridPos});
    } else if (ev.button == 2) { // right click
      dispatch({type: 'SET_MOUSE_DOWN', isLeft: false, isDown: true, downPos: gridPos});

    }
  }

  document.onmousemove = (ev) => {
    const state = store.getState();
    const gridPos = getClickedPos(ev);
    if (gridPos == null) return;
    dispatch({type: 'SET_MOUSE_POS', curPos: gridPos});
    if (state.game.mouse.isLeftDown && state.game.userMode === 'MARK') {
      const clickedEntities = collidesWith(
        {position: gridPos, width: 1, height: 1},
        getEntitiesByType(state.game, ['DIRT']),
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

let canvas = null;
const getClickedPos = (ev): Vector => {
  if (!canvas) {
    canvas = document.getElementById('canvas');
    // don't open the normal right-click menu
    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
    if (!canvas) {
      return null;
    }
  }
  const rect = canvas.getBoundingClientRect();

  const canvasPos = {
    x: ev.clientX - rect.left,
    y: ev.clientY - rect.top,
  };
  // return null if clicked outside the canvas:
  if (
    canvasPos.x < 0 || canvasPos.y < 0 ||
    canvasPos.x > config.canvasWidth || canvasPos.y > config.canvasHeight
  ) {
    return null;
  }
  return canvasToGrid(canvasPos);
};

const handleLeftClick = (
  state: State,
  dispatch: Dispatch,
  gridPos: Vector,
): void => {
  // handle creating locations
  if (state.game.userMode === 'CREATE_LOCATION') {
    const dimensions = subtract(gridPos, state.game.mouse.downPos);
    const locPosition = {...state.game.mouse.downPos};
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
  } else if (state.game.userMode === 'SELECT') {
    // handle selecting ants
    const {mouse} = state.game;
    const dims = subtract(mouse.curPos, mouse.downPos);
    const x = dims.x > 0 ? mouse.downPos.x : mouse.curPos.x;
    const y = dims.y > 0 ? mouse.downPos.y : mouse.curPos.y;
    const clickedAnts = collidesWith(
      {position: {x, y}, width: Math.abs(dims.x) + 1, height: Math.abs(dims.y) + 1},
      getEntitiesByType(state.game, ['ANT']),
    );
    if (clickedAnts.length > 0) {
      dispatch({
        type: 'SET_SELECTED_ENTITIES',
        entityIDs: clickedAnts.slice(0, config.maxSelectableAnts).map(entity => entity.id),
      });
    } else if (state.game.selectedEntities.length > 0) {
      dispatch({
        type: 'SET_SELECTED_ENTITIES',
        entityIDs: [],
      });
    }
  }
};

const handleRightClick = (state: State, dispatch: Dispatch, gridPos: Vector): void => {
  const selectedAntIDs = getSelectedAntIDs(state.game);
  const clickedEntity = collidesWith(
    {position: gridPos, width: 1, height: 1},
    getEntitiesByType(state.game, config.antPickupEntities),
  )[0];
  const clickedFood = collidesWith(
    {position: gridPos, width: 1, height: 1},
    getEntitiesByType(state.game, config.antEatEntities),
  )[0];
  // TODO add config for which entities block the ant
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
    const eatClicked = createDoAction('EAT', clickedFood);
    const pickupClicked = createDoAction('PICKUP', clickedEntity);
    const putdownClicked = createDoAction('PUTDOWN', {position: gridPos});
    if (state.game.antMode === 'EAT') {
      task.behaviorQueue.push(eatClicked);
    } else if (state.game.antMode === 'PICKUP') {
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
    } else if (state.game.antMode === 'FEED') {
      // TODO implement ants feeding each other
    }
    dispatch({
      type: 'ASSIGN_TASK',
      ants: selectedAntIDs,
      task,
    });
  }
};

module.exports = {initMouseControlsSystem};
