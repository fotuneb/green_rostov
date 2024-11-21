import React, { useState } from "react";
import { getCookie } from "../Cookies";
import { LuPlus } from "react-icons/lu"
import "./add_task.css"

const ws = process.env.REACT_APP_PUBLIC_URL

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
    fetch(`${ws}/api/task/?title=${content}&id_column=${columnId}&id_user=${getCookie("user_id")}`, {
      method: "PUT",
    }).then((req) => {
      req.json().then(props.onTaskAdded)
    })
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
