import React, { useState } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { LuTrash2 } from "react-icons/lu";
import { getCookie } from "../../utilities/cookies.js";
import { Column } from "../../utilities/api.js";
import Task from "../Task";
import AddTask from "../AddTask";
import "./column.css"

// Кастомные палитры цветов для колонок
function getColumnColors(columnId) {
  const colors = [
    {
      bgColor: "#D6CEFF",
      titleColor: "#392982",
      addTaskBgColor: "#E2DBFC",
      addTaskTextColor: "#392982"
    },

    {
      bgColor: "#C7E5FC",
      titleColor: "#1B4B73",
      addTaskBgColor: "#DBECFF",
      addTaskTextColor: "#1B4B73"
    },

    {
      bgColor: "#F9E7CD",
      titleColor: "#C28E4B",
      addTaskBgColor: "#FAF6EA",
      addTaskTextColor: "#C28E4B"
    },

    {
      bgColor: "#FAC7C6",
      titleColor: "#B53340",
      addTaskBgColor: "#F8DEDD",
      addTaskTextColor: "#B53340"
    },
  ]

  return colors[columnId % colors.length]
}

// Основной компонент колонки
function ColumnCompotent(props) {
  async function deleteColumn(columnId, index) {
    await Column.delete(columnId)
    props.onUpdateNeeded()
  }

  // Функционал фильтра
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

    if (filter.responsiblePerson && task.assignee != filter.responsiblePerson) {
      return false;
    }

    return true;
  })

  // Установка прав
  const hasRights = getCookie('role') != 'guest';

  // Установка возможных цветовых палитр
  const { bgColor, titleColor, addTaskBgColor, addTaskTextColor } = getColumnColors(props.column.id)

  return (
    <Draggable draggableId={props.column.id} index={props.index}>
      {(provided) => (
        <div
          className="board-column"
          {...provided.draggableProps}
          ref={provided.innerRef}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: bgColor
          }}
        >
          <div
            className="board-column-header"
            {...provided.dragHandleProps}
            style={{color: titleColor}}
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
              droppableId={`column-${props.column.id}`}
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
              bgColor={addTaskBgColor}
              textColor={addTaskTextColor}
            />}

          </div>
        </div>
      )}
    </Draggable>
  );
}

export default ColumnCompotent;
