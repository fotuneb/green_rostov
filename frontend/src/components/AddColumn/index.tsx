import React, { useState } from "react";
import "./add_column.css"

interface AddColumnProps {
  board: BoardData
  onColumnAdded: () => void
}

function AddColumn(props: AddColumnProps) {
  const [showNewColumnButton, setShowNewColumnButton] = useState(true);
  const [value, setValue] = useState("");

  // Обработка события завершения ввода
  function handleInputComplete(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (e.target instanceof HTMLInputElement) {
        addColumn(e.target.value);
        setShowNewColumnButton(true);
        setValue("");
      }
    }
  }

  // Добавление новой колонки
  async function addColumn(title: string) {
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
