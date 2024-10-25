import React from "react";
import { Draggable } from "react-beautiful-dnd";

function Task(props) {
  function deleteTask(columnId, index, taskId) {
    const column = props.board.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.splice(index, 1);

    const tasks = props.board.tasks;
    const { [taskId]: oldTask, ...newTasks } = tasks;

    props.setBoard({
      ...props.board,
      columns: {
        ...props.board.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
      tasks: newTasks,
    });
  }

  return (
    <Draggable draggableId={props.task.id} index={props.index}>
      {(provided) => (
        <div
          className="bg-white shadow rounded mt-4 px-3 pt-3 pb-5 border border-white"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div className="flex justify-between">
            <p className="text-gray-700 font-semibold tracking-wide text-sm">
              {props.task.content}
            </p>
          </div>
          <div className="flex mt-4 justify-between items-center">
            <span
              className="text-sm text-gray-600"
              onClick={() =>
                deleteTask(props.columnId, props.index, props.task.id)
              }
            >
              Удалить
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Task;
