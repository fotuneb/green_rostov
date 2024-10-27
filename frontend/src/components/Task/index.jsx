import { React, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { LuText } from "react-icons/lu"
import { Modal } from "../TaskModal"
import "./task.css"

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
      <Modal isOpen={isModalOpen} task={props.task} onClose={closeModal} onRemove={onRemove} />
      <Draggable draggableId={props.task.id} index={props.index}>
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
            <div className="task-pad">
              <LuText />
              {props.task.assigneeName}
            </div>
          </div>
        )}
      </Draggable>
    </>

  );
}

export default Task;
