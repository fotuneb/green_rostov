import React, { useState, useEffect } from "react";
import { getCookie } from "../../utilities/cookies.js";
import "./add_column.css"

const ws = process.env.REACT_APP_PUBLIC_URL

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
    fetch(ws + '/api/column/?title=' + title, {
      method: "PUT",
      headers: {
        'Authorization': 'Bearer ' + getCookie('token')
      }
    }).then((req) => {
      req.json().then(props.onColumnAdded)
    })
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
