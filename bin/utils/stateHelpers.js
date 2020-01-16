'use strict';

var _require = require('../utils/vectors'),
    add = _require.add,
    subtract = _require.subtract,
    makeVector = _require.makeVector,
    vectorTheta = _require.vectorTheta;

////////////////////////////////////////////////////////////////////////
// Grid Functions
////////////////////////////////////////////////////////////////////////

function insertInGrid(grid, position, item) {
  if (position == null) return;
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    grid[x] = [];
  }
  if (grid[x][y] == null) {
    grid[x][y] = [];
  }
  grid[x][y].push(item);
}

function deleteFromGrid(grid, position, item) {
  if (position == null) return;
  var x = position.x,
      y = position.y;

  if (grid[x] == null) return;
  if (grid[x][y] == null) return;
  grid[x][y] = grid[x][y].filter(function (i) {
    return i != item;
  });
}

function lookupInGrid(grid, position) {
  if (position == null) return [];
  var x = position.x,
      y = position.y;

  if (grid[x] == null) {
    return [];
  }
  if (grid[x][y] == null) {
    return [];
  }
  return grid[x][y];
}

////////////////////////////////////////////////////////////////////////
// Entity Functions
////////////////////////////////////////////////////////////////////////

function addEntity(game, entity) {
  game.entities[entity.id] = entity;
  game[entity.type].push(entity.id);

  var position = entity.position,
      width = entity.width,
      height = entity.height;

  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (var x = position.x; x < position.x + width; x++) {
    for (var y = position.y; y < position.y + height; y++) {
      insertInGrid(game.grid, { x: x, y: y }, entity.id);
    }
  }
}

function removeEntity(game, entity) {
  delete game.entities[entity.id];
  game[entity.type] = game[entity.type].filter(function (id) {
    return id != entity.id;
  });
  var position = entity.position,
      width = entity.width,
      height = entity.height;

  if (position == null) {
    return;
  }
  // handle entities with larger size
  for (var x = position.x; x < position.x + width; x++) {
    for (var y = position.y; y < position.y + height; y++) {
      deleteFromGrid(game.grid, { x: x, y: y }, entity.id);
    }
  }
}

function moveEntity(game, entity, nextPos) {
  var position = entity.position,
      width = entity.width,
      height = entity.height;
  // handle entities with larger size

  if (position != null) {
    for (var x = position.x; x < position.x + width; x++) {
      for (var y = position.y; y < position.y + height; y++) {
        deleteFromGrid(game.grid, { x: x, y: y }, entity.id);
      }
    }
  }
  for (var _x = nextPos.x; _x < nextPos.x + width; _x++) {
    for (var _y = nextPos.y; _y < nextPos.y + height; _y++) {
      insertInGrid(game.grid, { x: _x, y: _y }, entity.id);
    }
  }
  entity.prevPosition = entity.position;
  entity.position = nextPos;
  entity.theta = vectorTheta(subtract(entity.prevPosition, entity.position));
}

function changeEntityType(game, entity, oldType, nextType) {
  game[oldType] = game[oldType].filter(function (id) {
    return id != entity.id;
  });
  game[nextType].push(entity.id);
  entity.type = nextType;
}

module.exports = {
  insertInGrid: insertInGrid,
  deleteFromGrid: deleteFromGrid,
  lookupInGrid: lookupInGrid,

  addEntity: addEntity,
  removeEntity: removeEntity,
  moveEntity: moveEntity,
  changeEntityType: changeEntityType
};