import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Modal } from "@components/TaskModal";
import { useAvatar } from "@contexts/AvatarContext";
import AvatarImage from '@components/AvatarImage'
import "./task.css"

interface TaskProps {
  key: string
  task: TaskData
  columnId: string
  index: string
  board: BoardData
  onTaskDeleted: () => void
}

function Task(props: TaskProps): React.FC {
  const [isModalOpen, setModalOpen] = useState(false);

  // Данные по аватарке
  const { avatarData } = useAvatar();
  
  // Открытие и закрытие окна
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Обработка события удаления
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
              <AvatarImage userId={props.task.assignee} rerender={avatarData} />
            </div>
          </div>
        )}
      </Draggable>
    </>

  );
}

export default Task;
