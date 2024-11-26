import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Navigate } from "react-router-dom";
import { getCookie, isCookieExists } from "../../utilities/cookies.js";
import TaskFilter from "../../components/TaskFilter";
import ColumnCompotent from "../../components/Column";
import AddColumn from "../../components/AddColumn";
import { User, Board, Task, Column } from "../../utilities/api.js";
import "./board.css";

function BoardPage() {
  const [board, setBoard] = useState([]); // Инициализируем пустым массивом
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    responsiblePerson: '',
    filterText: '',
  });

  const [hasRights, setHasRights] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const role = getCookie('role');
    const token = isCookieExists('token');
    setHasRights(role !== 'guest');
    setIsLogged(token);
  }, []);

  useEffect(() => {
    fetchBoard().then(setBoard);
  }, []);

  async function fetchBoard() {
    const users = await User.getAll();
    setUsers(users);
    return await Board.fetch();
  }

  const updateBoard = (newBoardData) => {
    setBoard(newBoardData); // Обновляем board с новыми данными
  }

  const updateColumnOrder = (sourceIndex, destinationIndex) => {
    const newBoard = [...board]; // Делаем копию доски
    const [removedColumn] = newBoard.splice(sourceIndex, 1); // Удаляем столбец из старой позиции
    newBoard.splice(destinationIndex, 0, removedColumn); // Вставляем его в новое место
    setBoard(newBoard); // Обновляем состояние с новым порядком
  };

  const onDragEnd = ({ destination, source, draggableId, type }) => {
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    if (type === 'task') {
      const taskId = parseInt(parseDraggableId(draggableId, 1));
      const newColumnId = parseInt(parseDraggableId(destination.droppableId, 0));
      Task.move(taskId, newColumnId, destination.index).then(() => {
        // Обновляем доску после перемещения задачи
        fetchBoard().then(setBoard);
      });
    }

    if (type === 'column') {
      updateColumnOrder(source.index, destination.index); // Обновляем порядок колонок
      Column.move(draggableId, destination.index).then(() => {
        // Синхронизируем порядок с сервером
        fetchBoard().then(setBoard);
      });
    }
  };

  const parseDraggableId = (taskDraggableId, id) => {
    const match = taskDraggableId.match(/(\d+)$/);
    return match ? match[1] : null;
  };

  if (!isLogged) return <Navigate to="/login" />;

  return (
    <div className="board-main">
      <TaskFilter users={users} onFilterUpdate={(f) => setFilter(f)} />
      <div className="board board-columns font-inter">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div
                className="board-columns"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {board.map((column, index) => (
                  <ColumnCompotent
                    key={column.id}
                    board={board}
                    column={column}
                    tasks={column.tasks}
                    index={index} // Индекс колонки
                    filter={filter}
                    onUpdateNeeded={updateBoard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {hasRights && (
          <div className="container mx-auto flex justify-between my-5 px-2">
            <AddColumn board={board} onColumnAdded={updateBoard} />
          </div>
        )}
      </div>
    </div>
  );
}

export default BoardPage;
