import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utilities/cookies.js";
import TaskFilter from "../../components/TaskFilter";
import "./board.css";

import Column from "../../components/Column"
import AddColumn from "../../components/AddColumn";

const ws = process.env.REACT_APP_PUBLIC_URL

function Board({ token }) {
  const [board, setBoard] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    responsiblePerson: '',
    filterText: '',
  });

  const hasRights = getCookie('role') != 'guest';

  useEffect(() => {
    fetchBoard().then((data) => { setBoard(data) });
  }, []);

  async function fetchBoard() {
    const headers = {
      'Authorization': 'Bearer ' + getCookie('token')
    }

    const headersArg = { headers }

    const columnReq = await fetch(ws + '/api/columns', headersArg);
    let columns = await columnReq.json();

    const tasksReq = await fetch(ws + '/api/tasks', headersArg);
    const tasks = await tasksReq.json();

    const usersReq = await fetch(ws + '/api/get_users', headersArg);
    const users = await usersReq.json();

    setUsers(users);

    let idxToCol = {};
    for (let column of columns) {
      column.tasks = [];
      column.id = column.id + ''
      idxToCol[column.id] = column;
    }

    let userIdToName = {}
    for (const user of users) {
      userIdToName[user.id] = user.fullname;
    }

    for (let task of tasks) {
      task.id = task.id + '';
      task.assigneeName = userIdToName[task.assignee_id];
      task.authorName = userIdToName[task.author_id];
      let columnData = idxToCol[task.column_id];
      if (!columnData) {
        continue;
      }

      columnData.tasks.push(task);
    }

    return columns;

  }

  const updateBoard = () => {
    fetchBoard().then((data) => { setBoard(data) })
  }

  const onDragEnd = ({ destination, source, draggableId, type }) => {
    console.log(destination, source, draggableId, type)

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.indent === source.index
    ) {
      return;
    }

    if (type === 'task') {
      fetch(`${ws}/api/tasks/${draggableId}/move/?new_column_id=${destination.droppableId}&new_index=${destination.index}`, {
        method: "PUT"
      }).then((req) => {
        req.json().then(updateBoard)
      })
    }

    if (type === 'column') {
      fetch(`${ws}/api/columns/${draggableId}/move/?new_index=${destination.index}`, {
        method: "PUT"
      }).then((req) => {
        req.json().then(updateBoard)
      })
    }
  }

  return (
    <div className="board-main">
      <TaskFilter users={users} onFilterUpdate={(f) => setFilter(f)} />
      <div className="board board-columns font-inter">
        {token ? (
          <>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable
                droppableId="all-columns"
                direction="horizontal"
                type="column"
              >
                {(provided) => (
                  <div
                    className="board-columns"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {board.map((column) => {
                      return (
                        <Column
                          key={column.id}
                          board={board}
                          column={column}
                          tasks={column.tasks}
                          index={column.index}
                          filter={filter}
                          onUpdateNeeded={updateBoard}
                        />
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="container mx-auto flex justify-between my-5 px-2">
              <div className="flex justify-center">
                {hasRights && <AddColumn board={board} onColumnAdded={updateBoard} />}
              </div>
            </div>
          </>
        ) : (
          <Navigate to="/login" />
        )}
      </div>
    </div>
  )
}

export default Board;
