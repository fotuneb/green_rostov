import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Navigate } from "react-router-dom";
import { getCookie, isCookieExists } from "../../utilities/cookies.js";
import { AvatarProvider, useAvatar } from '../../contexts/AvatarContext/index.jsx';
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

  const hasRights = getCookie('role') !== 'guest';
  const isLogged = isCookieExists('token')

  // Контекст для аватарок
  const { avatarData, updateAvatar } = useAvatar();

  useEffect(() => {
    fetchBoard().then((data) => { setBoard(data) });
  }, []);

  async function fetchBoard() {
    const users = await User.getAll()
    setUsers(users);

    return await Board.fetch() 
  }

  const updateBoard = () => {
    fetchBoard().then((data) => { setBoard(data) })
  }

  function updateTaskOrder(board, taskId, newColumnId, newIndex) {
    let task
    let oldColumn
    let oldIndex

    taskId = taskId + ''
    newColumnId = newColumnId + ''

    for (let column of board) {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        if (taskIndex !== -1) {
            task = column.tasks[taskIndex]
            oldColumn = column
            oldIndex = taskIndex
            break
        }
    }

    if (!task)
      return

    const newBoard = [...board]

    const updatedOldColumn = {
        ...oldColumn,
        tasks: oldColumn.tasks.filter((t, index) => index !== oldIndex)
    }

    if (oldColumn.id === newColumnId) {
        updatedOldColumn.tasks.splice(newIndex, 0, task)
    } else {
        const newColumn = newBoard.find(column => column.id === newColumnId)
        if (!newColumn)
          return

        task.column_id = newColumnId
        const updatedNewColumn = {
            ...newColumn,
            tasks: [
                ...newColumn.tasks.slice(0, newIndex),
                task,
                ...newColumn.tasks.slice(newIndex),
            ],
        }

        newBoard.splice(newBoard.findIndex(column => column.id === newColumn.id), 1, updatedNewColumn)
    }

    newBoard.splice(newBoard.findIndex(column => column.id === updatedOldColumn.id), 1, updatedOldColumn)

    newBoard.forEach((column) => {
        column.tasks.forEach((task, index) => {
            task.index = index
        })
    })

    setBoard(newBoard);
  }

  const updateColumnOrder = (columnId, newIndex) => {
    let columnData
    for (let column of board) {
      if (column.id === columnId) {
        columnData = column
        break
      }
    }

    if (!columnData)
      return

    const oldIndex = columnData.index

    if (oldIndex < newIndex) {
      for (let column of board) {
        if (column.index > newIndex)
          continue

        if (column.index <= oldIndex)
          continue

        column.index -= 1
      }
    } else if (oldIndex > newIndex) {
      for (let column of board) {
        if (column.index < newIndex)
          continue

        if (column.index >= oldIndex)
          continue

        column.index += 1
      }
    }

    columnData.index = newIndex

    board.sort((a, b) => a.index - b.index)
    setBoard(board)
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
      updateTaskOrder(board, taskId, newColumnId, destination.index)
      Task.move(taskId, newColumnId, destination.index)
    }

    if (type === 'column') {
      updateColumnOrder(draggableId, destination.index)
      Column.move(draggableId, destination.index)
    }
  }

  return (
    <>
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
                            avatarData={avatarData}
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
    </>
  )
}

export default BoardPage;
