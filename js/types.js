// @flow

const Button = require('./ui/Button.react');

// -------------------------------------------------------------------------------
// Generic Types
// -------------------------------------------------------------------------------

export type Color = string;

export type Listener = () => mixed; // some callback passed to subscribe
export type Unsubscribe = () => mixed; // unsubscribe a listener
export type Store = {
  getState: () => State,
  dispatch: (action: Action) => Action, // dispatched action returns itself
  subscribe: (Listener) => Unsubscribe,
};

export type Modal = {
  title: string,
  text: string,
  buttons: Array<Button>
};

// -------------------------------------------------------------------------------
// General State
// -------------------------------------------------------------------------------

export type State = {
  game: ?GameState,
  modal: ?Modal,
};

// -------------------------------------------------------------------------------
// Game State
// -------------------------------------------------------------------------------

export type UserMode = 'MARK' | 'CREATE_LOCATION' | 'SELECT';
export type AntMode = 'PICKUP' | 'FEED' | 'EAT';
export type Mouse = {
  isLeftDown: boolean,
  isRightDown: boolean,
  downPos: Vector, // where the mouse down was pressed
  curPos: Vector,
};

export type GameState = {
  time: number,
  tickInterval: any, // when running, this is set

  // mouse interactions
  antMode: AntMode, // what ants do at clicked entities
  userMode: UserMode,
  mouse: Mouse,

  nextLocationName: string,

  selectedEntities: Array<EntityID>,
  // ALL entities (including ants) here:
  entities: {[EntityID]: Entity},
  // basically a cache of entityType-specific entityIDs:
  dirt: Array<EntityID>,
  ants: Array<EntityID>,
  locations: Array<EntityID>,
  food: Array<EntityID>,
  eggs: Array<EntityID>,
  larva: Array<EntityID>,
  pupa: Array<EntityID>,
  deadAnts: Array<EntityID>,

  tasks: Array<Task>, // tasks that can be assigned to ants
};

// -------------------------------------------------------------------------------
// Entities/Locations
// -------------------------------------------------------------------------------

export type EntityID = number;
export type EntityType =
  'ANT' | 'DIRT' | 'FOOD' | 'EGG' | 'LARVA' | 'PUPA' | 'LOCATION' | 'DEAD_ANT';

export type Entity = {
  id: EntityID,
  type: string,
  age: number,
  position: Vector,
  prevPosition: Vector,
  velocity: Vector,
  accel: Vector,

  width: number,
  height: number,

  marked: number, // scalar showing how "marked" this is e.g. for digging

  theta: Radians,
  thetaSpeed: Radians, // how theta changes over time

  // for rendering
  frameIndex: number,
  maxFrames: number,
  spriteSet: string,
};

export type Dirt = Entity;
export type Egg = Entity & {
  subType: AntSubType,
};
export type Larva = Entity & {
  calories: number,
  alive: boolean,
  subType: AntSubType,
};
export type Pupa = Entity & {
  subType: AntSubType,
};
export type Location = Entity & {
  name: string,
};
export type Food = Entity & {
  name: string,
  calories: number,
};

// -------------------------------------------------------------------------------
// Ants and their behavior
// -------------------------------------------------------------------------------

export type AntSubType = 'QUEEN' | 'WORKER';
export type Ant = Entity & {
  subType: AntSubType,
  holding: ?Entity,
  calories: number,
  blocked: boolean, // is this ant blocked from where it's going
  blockedBy: ?entity, // entity that is blocking it
  task: ?Task,
  taskIndex: number,
  alive: boolean,
};

export type AntActionType =
  'MOVE' | 'PICKUP' | 'PUTDOWN' | 'ATTACK' | 'EAT' | 'FEED' | 'MARK' | 'LAY' |
  'HATCH' | 'COMMUNICATE' | 'IDLE';
export type AntAction = {
  type: AntActionType,
  payload: {
    // string includes:
    //  - "RANDOM" option for MOVE action
    //  - location name for PICKUP action
    //  - "MARKED" option for PICKUP action
    //  - "BLOCKER" option for PICKUP action
    object: Entity | Location | string,
  },
};

export type ConditionType =
  'LOCATION' | 'HOLDING' | 'CALORIES' | 'AGE' | 'NEIGHBORING' | 'RANDOM' |
  'BLOCKED';
export type ConditionComparator = 'EQUALS' | 'LESS_THAN' | 'GREATER_THAN';
export type Pronoun = 'ANYTHING' | 'NOTHING';
export type Condition = {
  type: ConditionType,
  comparator: ConditionComparator,
  payload: {
    // string includes:
    //  - "MARKED" option for NEIGHBORING blueprint dirt
    //  - "RANDOM" option for stochastic process uses number
    //  - Location name instead of location entity itself
    object: Entity | Location | string | Pronoun | number,
  },
  not: boolean,
};

export type DoActionBehavior = {
  type: 'DO_ACTION',
  action: AntAction,
};
export type ConditionalBehavior = {
  type: 'IF',
  condition: Condition,
  behavior: Behavior,
  elseBehavior: ?Behavior,
};
export type DoWhileBehavior = {
  type: 'WHILE',
  condition: Condition,
  behavior: Behavior,
};
export type SwitchToTaskBehavior = {
  type: 'SWITCH_TASK',
  task: string, // name of the task
};
export type Behavior =
  DoActionBehavior |
  SwitchToTaskBehavior |
  ConditionalBehavior |
  DoWhileBehavior;

export type Task = {
  name: string,
  behaviorQueue: Array<Behavior>,
  index: number,
  repeating: boolean,
};

// -------------------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------------------

export type Action =
  {type: 'RESTART'} |
  {type: 'START'} |
  {type: 'SET_MODAL', modal: Modal} |
  {type: 'DISMISS_MODAL'} |
  {type: 'STOP_TICK'} |
  {type: 'TICK'} |
  {type: 'CREATE_ENTITY', entity: Entity} |
  {type: 'SET_SELECTED_ENTITIES', entityIDs: Array<EntityID>} |
  {type: 'DESTROY_ENTITY', id: EntityID} |
  {type: 'UPDATE_TASK', task: Task, originalName: string} |
  {type: 'CREATE_TASK', task: Task} |
  {TYPE: 'UPDATE_NEXT_LOCATION_NAME', name: string} |
  {type: 'ASSIGN_TASK', task: Task, ants: Array<EntityID>} |
  {type: 'SET_USER_MODE', userMode: UserMode} |
  {type: 'SET_ANT_MODE', antMode: AntMode} |
  {type: 'SET_MOUSE_DOWN', isLeft: boolean, isDown: boolean, downPos: Vector} |
  {type: 'SET_MOUSE_POS', curPos: Vector} |
  {type: 'MARK_ENTITY', entityID: EntityID, quantity: number};

