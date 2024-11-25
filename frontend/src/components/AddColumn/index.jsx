import React, { useState, useEffect } from "react";
import { Column } from "../../utilities/api.js";
import "./add_column.css"

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

  async function addColumn(title) {
    await Column.create(title)
    props.onColumnAdded()
  }

  return (
    <>
      {showNewColumnButton ? (
        <button className="add-column font-inter font-semibold" onClick={() => setShowNewColumnButton(false)}>
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
    </>
  );
}

export default AddColumn;
