import React, { useState } from "react";

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

    const newTask = {
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
    <div className="mt-3 text-sm text-gray-600">
      {showNewTaskButton ? (
        <button
          className="px-2 py-1"
          onClick={() => setShowNewTaskButton(false)}
        >
          New task
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
    </div>
  );
}

export default AddTask;
