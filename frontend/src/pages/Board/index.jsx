import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Navigate } from "react-router-dom";
import { getCookie } from "../../utilities/cookies.js";
import TaskFilter from "../../components/TaskFilter";
import Column from "../../components/Column"
import AddColumn from "../../components/AddColumn";
import "./board.css";

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
      'Authorization': 'Bearer ' + getCookie('token'),
      'Accept': 'application/json'
    }

    const headersArg = {
      method: "GET",
      headers
    }

    const columnReq = await fetch('/api/columns', headersArg);
    let columns = await columnReq.json();

    const tasksReq = await fetch('/api/tasks', headersArg);
    const tasks = await tasksReq.json();

    const usersReq = await fetch('/api/get_users', headersArg);
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
      task.assigneeName = userIdToName[task.assignee];
      task.authorName = userIdToName[task.author];
      let columnData = idxToCol[task.column_id];
      if (!columnData) {
        continue;
      }

      columnData.tasks.push(task);
    }

    for (let column of columns) {
      column.tasks.sort((a, b) => a.index - b.index);
    }

    return columns;

  }

  const updateBoard = () => {
    fetchBoard().then((data) => { setBoard(data) })
  }

  const parseDraggableId = (taskDraggableId, id) => {
    const match = taskDraggableId.match(/(\d+)$/);
    return match ? match[id] : null;
  }

  const onDragEnd = ({ destination, source, draggableId, type }) => {
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
      const task_id = parseInt(parseDraggableId(draggableId, 1))
      const new_column_id = parseInt(parseDraggableId(destination.droppableId, 0))

      fetch(`${ws}/api/tasks/move`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_id: task_id,
          new_column_id: new_column_id,
          new_index: destination.index
        })
      }).then((req) => {
        req.json().then(updateBoard)
      })
    }

    if (type === 'column') {
      fetch(`api/columns/move`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          column_id: draggableId,
          new_index: destination.index
        })
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
