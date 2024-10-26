import React, { useState } from "react";
import { LuPlus } from "react-icons/lu"
import "./add_task.css"

function AddTask(props) {
  const [showNewTaskButton, setShowNewTaskButton] = useState(true);
  const [value, setValue] = useState("");

  function handleInputComplete(event) {
    if (event.key === "Enter" && event.target.value !== "") {
      addNewTask(event.target.value, props.columnId);

      setShowNewTaskButton(true);
      setValue("");
    }
  }

  function addNewTask(content, columnId) {
    const newTaskId = "task-" + Math.floor(Math.random() * 1000000);

    const column = props.board.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.push(newTaskId);

    
    const newTask = {  /* need to change, create body where will be content and responsible */
      id: newTaskId,
      content: content,
    };

    props.setBoard({
      ...props.board,
      tasks: {
        ...props.board.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...props.board.columns,
        [column.id]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
    });
  }

  return (
    <>
      {showNewTaskButton ? (
        <button
          className="add-task font-inter font-semibold"
          onClick={() => setShowNewTaskButton(false)}
        >
          <LuPlus />
          Добавить задачу
        </button>
      ) : (
        <input
          autoFocus
          type="text"
          className="bg-white shadow border border-white rounded px-2 py-1 outline-none focus:outline-none"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleInputComplete}
          onBlur={() => setShowNewTaskButton(true)}
        />
      )}
    </>
  );
}

export default AddTask;
