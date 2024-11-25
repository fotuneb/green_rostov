import React, { useState } from "react";
import { Task } from "../../utilities/api";
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

  async function addNewTask(content, columnId) {
    await Task.create(content, parseInt(columnId))
    props.onTaskAdded()
  }

  return (
    <>
      {showNewTaskButton ? (
        <button
          className="add-task font-inter font-semibold"
          style={{
            backgroundColor: props.bgColor,
            color: props.textColor
          }}
          onClick={() => setShowNewTaskButton(false)}
        >
          <LuPlus /> Добавить задачу
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
