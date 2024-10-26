import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { LuText } from "react-icons/lu"
import { Modal } from "../TaskModal"
import "./task.css"

function Task(props) {
  function deleteTask(columnId, index, taskId) {
    const column = props.board.columns[columnId];
    const newTaskIds = Array.from(column.taskIds);
    newTaskIds.splice(index, 1);

    const tasks = props.board.tasks;
    const { [taskId]: oldTask, ...newTasks } = tasks;

    props.setBoard({
      ...props.board,
      columns: {
        ...props.board.columns,
        [columnId]: {
          ...column,
          taskIds: newTaskIds,
        },
      },
      tasks: newTasks,
    });
  }

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <Draggable draggableId={props.task.id} index={props.index}>
      {(provided) => (
        <button
          onClick={openModal}
          className="task"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <p className="font-regular task-pad">
            {props.task.content}
          </p>
          <Modal isOpen={isModalOpen} onClose={closeModal} />
          <div className="task-pad">
            <span
              onClick={() =>
                deleteTask(props.columnId, props.index, props.task.id)
              }
            >
              <LuText />
            </span>
          </div>
        </button>
      )}
    </Draggable>
  );
}

export default Task;