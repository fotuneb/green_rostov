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

  let filter = props.filter;
  let tasks = props.tasks.filter((task) => {
    if (filter.filterText != '' && !task.title.includes(filter.filterText)) {
      return false;
    }

    const taskCreateDate = new Date(task.created_at).getTime()
    if (filter.startDate) {
      const date = new Date(filter.startDate).getTime()
      if (date > taskCreateDate) {
        return false;
      }
    }

    if (filter.endDate) {
      const date = new Date(filter.endDate).getTime()
      if (date < taskCreateDate) {
        return false;
      }
    }

    if (filter.responsiblePerson && task.assignee_id != filter.responsiblePerson) {
      return false;
    }

    return true;
  })

  const hasRights = localStorage.getItem('role') != 'guest';

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

            {hasRights && <span
              className="text-gray-600"
              onClick={() => deleteColumn(props.column.id, props.index)}
            >
              <LuTrash2 />
            </span>}

          </div>
          <div className="h-full">
            <Droppable
              droppableId={`column${props.column.id}`}
              direction="vertical"
              type="task"
            >
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {tasks.map((task) => (
                    <Task
                      key={task.id}
                      task={task}
                      columnId={task.column_id}
                      index={task.index}
                      board={props.board}
                      onTaskDeleted={props.onUpdateNeeded}
                    />
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {hasRights && <AddTask
              board={props.board}
              columnId={props.column.id}
              onTaskAdded={props.onUpdateNeeded}
            />}

          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Column;
