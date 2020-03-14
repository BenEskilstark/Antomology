// @flow

const Button = require('./ui/Button.react');

// -------------------------------------------------------------------------------
// Generic Types
// -------------------------------------------------------------------------------

export type Color = string;

export type Radian = number;

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
  mode: 'MENU' | 'GAME' | 'EDITOR';
  game: ?GameState,
  editor: ?EditorState,
  modal: ?Modal,
  hotKeys: Hotkeys,
};


export type EditorMode =
  'CREATE_ENTITY' | 'CREATE_LOCATION' | 'MARK_TRAIL' | 'MARQUEE_ENTITY' |
  'DELETE_ENTITY';
export type EditorState = {
  actions: Array<Action>,
  editorMode: EditorMode,
  entityType: EntityType,
  antSubType: AntSubType,
  backgroundType: 'SKY' | 'DIRT',
  allowDeleteBackground: boolean,
};

// -------------------------------------------------------------------------------
// Game State
// -------------------------------------------------------------------------------

export type UserMode =
  'MARK_TRAIL' | 'CREATE_LOCATION' | 'SELECT' | 'PAN' | 'DELETE_LOCATION';
export type AntMode = 'PICKUP' | 'FEED' | 'EAT';
export type Mouse = {
  isLeftDown: boolean,
  isRightDown: boolean,
  downPos: Vector, // where the mouse down was pressed (in grid-space)
  curPos: Vector, // grid position of mouse
  prevPos: Vector, // previous grid position of the mouse
  curPixel: Vector, // pixel position of mouse
  prevPixel: Vector,
};
// uses left/right/up/down and enter/space/meta
export type HotKeys = {
  onKeyDown: {[key: string]: (store) => void},
  onKeyUp: {[key: string]: (store) => void},
  onKeyPress: {[key: string]: (store) => void},
  keysDown: {[key: string]: boolean},
};
export type InfoTab =
  'Pheromones' | 'Locations' | 'Colony Status' | 'Options' | 'None';

export type PheromoneCategories = {
  [number]: {
    strength: number,
    condition: ?Condition,
  }
};

export type GameState = {
  time: number,
  tickInterval: any, // when running, this is set

  // UI/UX interactions
  antMode: AntMode, // what ants do at clicked entities
  userMode: UserMode,
  infoTab: InfoTab,
  mouse: Mouse,
  hotKeys: HotKeys,
  ticker: {
    text: string,
    curAge: number,
    maxAge: number,
  },
  hoverCard: {
    jsx: string,
    mouseStillTime: number,
  },

  // UI-based partial state
  nextLocationName: string,
  prevPheromone: ?EntityID, // DEPRECATED
  curEdge: ?EdgeID, // DEPRECATED

  // pheromones for ants
  pheromones: PheromoneCategories,

  edges: {[EdgeID]: Edge},

  // world info in grid coords
  worldWidth: number,
  worldHeight: number,
  viewPos: Vector, // where in the world we're looking

  selectedEntities: Array<EntityID>,
  // ALL entities (including ants) here:
  entities: {[EntityID]: Entity},
  // basically a cache of entityType-specific entityIDs:
  [EntityType]: Array<EntityID>,

  // for faster collision detection
  grid: Array<Array<Array<EntityID>>>,

  fog: boolean,

  gameOver: 'win' | 'lose' | null,
  level: number,

  tasks: Array<Task>, // tasks that can be assigned to ants
};

// -------------------------------------------------------------------------------
// Entities/Locations
// -------------------------------------------------------------------------------

export type EntityID = number;
export type EntityType =
  'ANT' | 'DIRT' | 'FOOD' | 'EGG' | 'LARVA' | 'PUPA' | 'LOCATION' | 'GRASS'
  'PHEROMONE' | 'BACKGROUND' | 'STONE' | 'OBELISK' |'STUCK_STONE' | 'TARGET' |
  'BEETLE' | 'LADYBUG' | 'APHID' | 'SPIDER' | 'WORM' | 'CENTIPEDE' | 'DRAGONFLY';

export type Entity = {
  id: EntityID,
  type: EntityType,
  age: number,
  position: Vector,
  prevPosition: Vector,
  velocity: Vector,
  accel: Vector,

  width: number,
  height: number,

  toLift: number, // number of ants needed to lift it
  heldBy: Array<EntityID>,
  lifted: boolean,

  // for fog of war
  visible: boolean,
  lastSeenPos: Vector,

  theta: Radians,
  thetaSpeed: Radians, // how theta changes over time

  // for rendering
  frameIndex: number,
  maxFrames: number,
  spriteSet: string,
};

export type EdgeID = number;
export type Edge = {
  id: EdgeID,
  start: EntityID,
  end: ?EntityID,
  condition: ?Condition,
  pheromones: Array<EntityID>,
};
export type Location = Entity & {
  name: string,
  incomingEdges: Array<EdgeID>,
  outgoingEdges: Array<EdgeID>,
  task: Task,
};

export type Dirt = Entity;
export type Egg = Entity & {
  alive: boolean,
  subType: AntSubType,
};
export type Larva = Entity & {
  calories: number,
  alive: boolean,
  subType: AntSubType,
};
export type Pupa = Entity & {
  alive: boolean,
  subType: AntSubType,
};
export type Food = Entity & {
  name: string,
  calories: number,
};
export type Pheromone = Entity & {
  category: number, // so there can be different kinds of trails
  quantity: number,
  edge: EdgeID,
  prevPheromone: ?EntityID, // id of previous pheromone for the purpose
                           // of following a trail backwards
};
export type Background = Entity & {
  subType: 'SKY' | 'DIRT'
};

export type Bug = Entity & {
  alive: boolean,
  segmented: ?boolean,
};

// -------------------------------------------------------------------------------
// Ants and their behavior
// -------------------------------------------------------------------------------

export type AntSubType = 'QUEEN' | 'WORKER';
export type Ant = Entity & {
  subType: AntSubType,
  holding: ?Entity,
  leadHolder: boolean, // is this holding something and the leader
  calories: number,
  blocked: boolean, // is this ant blocked from where it's going
  blockedBy: ?entity, // entity that is blocking it
  location: ?Entity, // location the ant thinks it's at
  task: ?Task,
  taskIndex: number,
  // whenever you switch tasks, push old task as parent onto taskStack
  // whenever you finish a task, pop off the end to resume
  taskStack: Array<{
    name: string,
    index: number, // your index in the parent task
  }>,
  alive: boolean,
  prevPheromone: ?EntityID, // id of pheromone ant just laid
  eggLayingCooldown: number, // for the queen
};

export type AntActionType =
  'MOVE' | 'PICKUP' | 'PUTDOWN' | 'ATTACK' | 'EAT' | 'FEED' | 'MARK' | 'LAY' |
  'HATCH' | 'COMMUNICATE' | 'IDLE';

// -------------------------------------------------------------------------------
// Low-level Tasks
// -------------------------------------------------------------------------------
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
  'BLOCKED' | 'IS_QUEEN';
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
export type HighLevelDoActionBehavior = {
  type: 'DO_HIGH_LEVEL_ACTION',
  action: {
    type: AntActionType,
    payload: {
      object: Entity | Location | string,
    },
  },
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
  DoWhileBehavior |
  HighLevelDoActionBehavior;

export type Task = {
  name: string,
  behaviorQueue: Array<Behavior>,
  repeating: boolean,
};

// -------------------------------------------------------------------------------
// Actions
// -------------------------------------------------------------------------------

export type Action =
  {type: 'RESTART'} |
  {type: 'START', level: number} |
  {type: 'SET_MODAL', modal: Modal} |
  {type: 'DISMISS_MODAL'} |
  {type: 'STOP_TICK'} |
  {type: 'START_TICK', updateSim: boolean} |
  {type: 'TOGGLE_FOG', fog: boolean} |
  {type: 'TICK', updateSim: boolean} | // whether the sim should update on ticks
  {type: 'CREATE_ENTITY', entity: Entity} |
  {
    type: 'CREATE__MANY_ENTITIES',
    pos: Vector, width: number, height: number,
    editorState: {antSubType: string, backgroundType: string},
  } |
  {type: 'SET_SELECTED_ENTITIES', entityIDs: Array<EntityID>} |
  {type: 'DESTROY_ENTITY', id: EntityID} |
  {type: 'UPDATE_TASK', task: Task, originalName: string} |
  {type: 'CREATE_TASK', task: Task} |
  {type: 'UPDATE_LOCATION_NAME', id: EntityID, newName: string} |
  {type: 'UPDATE_NEXT_LOCATION_NAME', name: string} |
  {type: 'UPDATE_LOCATION_TASK', task: Task, id: EntityID} |
  {type: 'ASSIGN_TASK', task: Task, ants: Array<EntityID>} |
  {type: 'SET_USER_MODE', userMode: UserMode} |
  {type: 'SET_INFO_TAB', infoTab: InfoTab} |
  {type: 'SET_ANT_MODE', antMode: AntMode} |
  {type: 'SET_MOUSE_DOWN', isLeft: boolean, isDown: boolean, downPos: Vector} |
  {type: 'UPDATE_THETA', id: EntityID, theta: Radian} |
  {type: 'SET_PREV_PHEROMONE', id: EntityID} |
  {type: 'SET_VIEW_POS', viewPos: Vector} |
  {type: 'ZOOM', out: number} |
  {type: 'CREATE_EDGE', start: EntityID} |
  {type: 'UPDATE_EDGE', id: EdgeID, edge: Edge} |
  {type: 'SET_CUR_EDGE', curEdge: EdgeID} |
  {type: 'SET_MOUSE_POS', curPos: Vector, curPixel: Vector} |
  {type: 'SET_EDITOR_MODE', editorMode: EditorMode} |
  {type: 'SET_EDITOR_ENTITY', entityType: EntityType} |
  {type: 'APPLY_GAME_STATE', game: GameState} |
  {type: 'SET_WORLD_SIZE', width: ?number, height: ?number} |
  {type: 'SET_GAME_OVER', gameOver: 'win' | 'lose' | null} |
  {type: 'RETURN_TO_MENU'} |
  {type: 'SET_EDITOR_ALLOW_DELETE_BACKGROUND', allow: boolean} |
  {type: 'SET_EDITOR_ANT_SUBTYPE', subType: AntSubType} |
  {type: 'SET_KEY_PRESS', key: string, pressed: boolean} |
  {type: 'SET_HOVER_CARD_JSX', jsx: string} |
  {type: 'SET_HOVER_CARD_TIME', mouseStillTime: number} |
  {
    type: 'SET_HOTKEY',
    press: 'onKeyUp' | 'onKeyDown' | 'onKeyPress',
    key: string,
    fn: (store) => void
  } |
  {type: 'SET_PHEROMONE_STRENGTH', category: number, strength: number} |
  {type: 'SET_TICKER', text: string, maxAge: number} |
  {type: 'SET_EDITOR_BACKGROUND_TYPE', backgroundType: 'SKY' | 'DIRT'};

