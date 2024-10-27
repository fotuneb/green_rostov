import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { LuTrash2 } from "react-icons/lu"
import Task from "../Task";
import AddTask from "../AddTask";
import "./column.css"

const ws = process.env.REACT_APP_PUBLIC_URL

function Column(props) {
  function deleteColumn(columnId, index) {
    fetch(`${ws}/api/column/${columnId}`, {
      method: "DELETE"
    }).then((req) => {
      req.json().then(props.onUpdateNeeded)
    })
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
                  {props.tasks.map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      columnId={task.column_id}
                      index={task.index}
                      onTaskDeleted={props.onUpdateNeeded}
                    />
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            <AddTask
              board={props.board}
              columnId={props.column.id}
              onTaskAdded={props.onUpdateNeeded}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
