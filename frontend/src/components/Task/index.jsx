import { React, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Modal } from "../TaskModal"
import { User } from "../../utilities/api.js";
import "./task.css"
import { getCookie } from "../../utilities/cookies";

function Task(props) {
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const onRemove = () => {
    closeModal();
    props.onTaskDeleted()
  }

  return (
    <>
      <Modal isOpen={isModalOpen} task={props.task} onUpdateNeeded={props.onTaskDeleted} onClose={closeModal} board={props.board} onRemove={onRemove} />
      <Draggable draggableId={`task-${props.columnId}-${props.task.id}`} index={props.index}>
        {(provided) => (
          <div
            onClick={openModal}
            className="task"
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            <p className="font-regular task-pad">
              {props.task.title}
            </p>
            <div className="task-pad task-creator-container">
              <span className="task-creator-name">{props.task.assigneeName}</span>
              <div className="task-avatar"><img src={props.avatarPath} alt="" /></div>
            </div>
          </div>
        )}
      </Draggable>
    </>

  );
}

export default Task;
