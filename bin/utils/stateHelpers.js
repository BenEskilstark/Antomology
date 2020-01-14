'use strict';

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
  insertInGrid(game.grid, entity.position, entity.id);
  // TODO handle entities with larger size
}

function removeEntity(game, entity) {
  delete game.entities[entity.id];
  game[entity.type] = game[entity.type].filter(function (id) {
    return id != entity.id;
  });
  deleteFromGrid(game.grid, entity.position, entity.id);
  // TODO handle entities with larger size
}

function moveEntity(game, entity, nextPos) {
  deleteFromGrid(game.grid, entity.position, entity.id);
  insertInGrid(game.grid, nextPos, entity.id);
  entity.prevPosition = entity.position;
  entity.position = nextPos;
  // TODO handle entities with larger size
}

function changeEntityType(game, entity, oldType, nextType) {
  game[oldType] = game[entity.type].filter(function (id) {
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