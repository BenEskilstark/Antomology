// @flow

const React = require('react');
const {config} = require('../config');
const Button = require('./components/Button.react');
const Checkbox = require('./components/Checkbox.react');
const Dropdown = require('./components/Dropdown.react');
const {useState, useEffect} = React;
const BehaviorCard = require('./BehaviorCard.react');

import type {Ant, State, Action, Task} from '../types';

type Props = {
  state: State,
  dispatch: (Action) => Action,
  task: Task,
  setTaskName: (string) => void, // so the parent knows which task is being edited
  newTask: boolean,
};

function TaskCard(props: Props): React.Node {
  const {state, dispatch, task, newTask} = props;
  const [repeating, setRepeating] = useState(task.repeating);
  const [taskName, setTaskName] = useState(task.name);
  // "deep-copy" behaviorQueue so that BehaviorCards can mutate it
  const [behaviorQueue, setBehaviorQueue] = useState(
    task.behaviorQueue.map(b => JSON.parse(JSON.stringify(b))),
  );
  const [importedTask, setImportedTask] = useState('');

  useEffect(() => {
    setRepeating(task.repeating);
    setTaskName(task.name);
    setBehaviorQueue(
      task.behaviorQueue.map(b => JSON.parse(JSON.stringify(b))),
    );
  }, [task.name, task.repeating, task.behaviorQueue]);

  const behaviors = behaviorQueue.map((b, i) => {
    return (
      <div key={'behavior_' + i}>
        <BehaviorCard state={state} behavior={b} />
      </div>
    );
  });
  return (
    <div
      className="taskCard"
      style={{
      }}
    >
      <div>
        Name:
        <input type='text'
          placeholder='Task Name'
          onChange={(ev) => {
            setTaskName(ev.target.value)
          }}
          value={taskName}>
        </input>
      </div>
      <div>
        Repeating:
        <Checkbox checked={repeating} onChange={setRepeating} />
      </div>
      <div>
        BehaviorQueue:
        <div>{behaviors}</div>
        <Button
          label="Add Behavior"
          onClick={() => {
            setBehaviorQueue(behaviorQueue.concat({
              type: 'DO_ACTION',
              action: {
                type: 'IDLE',
                payload: {
                  object: null,
                },
              },
            }));
          }}
        />
      </div>
      <Button
        label={newTask || taskName != task.name ? 'Create Task' : 'Update Task'}
        onClick={() => {
          if (taskName === 'New Task') {
            return;
          }
          const editedTask = {name: taskName, repeating, behaviorQueue};
          if (newTask || taskName != task.name) {
            dispatch({type: 'CREATE_TASK', task: editedTask});
            props.setTaskName(taskName);
          } else {
            dispatch({type: 'UPDATE_TASK', task: editedTask});
          }
        }}
      />
      <Button
        label="Export Task as JSON"
        onClick={
          () => console.log(JSON.stringify({name: taskName, repeating, behaviorQueue}))
        }
      />
      <Button
        label="Import Pasted Task from JSON"
        onClick={() => {
          if (importedTask != '') {
            setTaskName(importedTask.name);
            setRepeating(importedTask.repeating);
            setBehaviorQueue(importedTask.behaviorQueue);
          }
        }}
      />
      <input type="text" style={{width: '25px'}}
        value={JSON.stringify(importedTask)} onChange={(ev) => {
          setImportedTask(JSON.parse(ev.target.value));
        }}
      />
    </div>
  );
}

module.exports = TaskCard;
