import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { LuTrash2 } from "react-icons/lu"
import Task from "../Task";
import AddTask from "../AddTask";
import "./column.css"

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
          className="board-column"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div
            className="board-column-header"
            {...provided.dragHandleProps}
          >
            <span className="font-semibold">
              {props.column.title}
            </span>

            <span
              className="text-gray-600"
              onClick={() => deleteColumn(props.column.id, props.index)}
            >
              <LuTrash2 />
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
