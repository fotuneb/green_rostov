import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Navigate } from "react-router-dom";
import { getCookie, isCookieExists } from "../../utilities/cookies.js";
import TaskFilter from "../../components/TaskFilter";
import ColumnCompotent from "../../components/Column"
import AddColumn from "../../components/AddColumn";
import { User, Board, Task, Column } from "../../utilities/api.js";
import "./board.css";

function BoardPage() {
  const [board, setBoard] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    responsiblePerson: '',
    filterText: '',
  });

  const hasRights = getCookie('role') != 'guest';
  const isLogged = isCookieExists('token')

  useEffect(() => {
    fetchBoard().then((data) => { setBoard(data) });
  }, []);

  async function fetchBoard() {
    const users = await User.getAll()
    setUsers(users);

    return await Board.fetch() 
  }

  const updateScroll = () => {
    const overflowState = {
      overflowX: "hidden"
    }

    

    return overflowState
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
      const taskId = parseInt(parseDraggableId(draggableId, 1))
      const newColumnId = parseInt(parseDraggableId(destination.droppableId, 0))
      Task.move(taskId, newColumnId, destination.index).then(updateBoard)
    }

    if (type === 'column')
      Column.move(draggableId, destination.index).then(updateBoard)
  }

  return (
    <div className="board-main">
      <TaskFilter users={users} onFilterUpdate={(f) => setFilter(f)} />
      <div className="board board-columns font-inter">
        {isLogged ? (
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
                        <ColumnCompotent
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

export default BoardPage;
