import React, { useState } from "react";

function AddColumn(props) {
  const [showNewColumnButton, setShowNewColumnButton] = useState(true);
  const [value, setValue] = useState("");

  function handleInputComplete(event) {
    if (event.key === "Enter") {
      addColumn(event.target.value);

      setShowNewColumnButton(true);
      setValue("");
    }
  }

  function addColumn(title) {
    const newColumnId = "column-" + Math.floor(Math.random() * 1000000);

    const newColumnOrder = Array.from(props.board.columnOrder);
    newColumnOrder.push(newColumnId);

    const newColumn = {
      id: newColumnId,
      title: title,
      taskIds: [],
    };

    props.setBoard({
      ...props.board,
      columns: {
        ...props.board.columns,
        [newColumnId]: newColumn,
      },
      columnOrder: newColumnOrder,
    });
  }

  return (
    <div className="text-sm text-gray-600">
      {showNewColumnButton ? (
        <button onClick={() => setShowNewColumnButton(false)}>
          Добавить столбец
        </button>
      ) : (
        <input
          autoFocus
          type="text"
          className="border rounded-md px-2 py-1 outline-none focus:outline-none"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleInputComplete}
          onBlur={() => setShowNewColumnButton(true)}
        />
      )}
    </div>
  );
}

export default AddColumn;
