import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import Task from "./Task";
import AddTask from "./AddTask";

function Column(props) {
  function deleteColumn(columnId, index) {
    const columnTasks = props.board.columns[columnId].taskIds;

    const finalTasks = columnTasks.reduce((previousValue, currentValue) => {
      const { [currentValue]: oldTask, ...newTasks } = previousValue;
      return newTasks;
    }, props.board.tasks);

    const columns = props.board.columns;
    const { [columnId]: oldColumn, ...newColumns } = columns;

    const newColumnOrder = Array.from(props.board.columnOrder);
    newColumnOrder.splice(index, 1);

    props.setBoard({
      tasks: finalTasks,
      columns: newColumns,
      columnOrder: newColumnOrder,
    });
  }

  return (
    <Draggable draggableId={props.column.id} index={props.index}>
      {(provided) => (
        <div
          className="bg-gray-100 rounded-lg px-3 py-3 column-width rounded mx-2"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div
            className="flex justify-between tracking-wide text-sm"
            {...provided.dragHandleProps}
          >
            <span className="text-gray-700 font-semibold">
              {props.column.title} ({props.tasks.length})
            </span>
            <span
              className="text-gray-600"
              onClick={() => deleteColumn(props.column.id, props.index)}
            >
              Удалить
            </span>
          </div>
          <div className="h-full">
            <Droppable
              droppableId={props.column.id}
              direction="vertical"
              type="task"
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {props.tasks.map((task, index) => (
                    <Task
                      key={task.id}
                      task={task}
                      columnId={props.column.id}
                      index={index}
                      board={props.board}
                      setBoard={props.setBoard}
                    />
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <AddTask
              board={props.board}
              setBoard={props.setBoard}
              columnId={props.column.id}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
