import React, { useState, useRef, useEffect } from 'react';
import { getCookie } from '../../utilities/cookies.js';
import ReactQuill from 'react-quill';
import { Task, User } from '../../utilities/api.js';
import 'react-quill/dist/quill.snow.css'; // Импорт стилей для редактора
import './task_modal.css';

const ws = process.env.REACT_APP_PUBLIC_URL

const formatDate = (dateString, reversed) => {
    const date = new Date(dateString); // Преобразуем строку в объект Date
  
    // Получаем компоненты даты и времени
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Месяцы в JS начинаются с 0
    const year = date.getUTCFullYear();
  
    // Форматируем в нужный вид
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

const DeadlineRow = ({isEditing, setIsEditing, deadlineValue, onEdited}) => {
    const [newValue, setNewValue] = useState('')

    if (isEditing) {
        return (
            <>
            <input
                type="date"
                className="task-deadline-input"
                onChange={(e) => setNewValue(e.target.value)}
            />
            <button onClick={() => {onEdited(newValue); setIsEditing(false)}}>Z</button>
            </>

        )
    }

    return (
        <p onClick={() => setIsEditing(true)}>
            {deadlineValue || 'Не установлен (нажмите для редактирования)'}
        </p>
    )
}

export const Modal = ({ isOpen, onClose, task, onRemove, board, onUpdateNeeded }) => {
    const [taskData, setTaskData] = useState(task);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [title, setTitle] = useState(taskData.title);
    const [description, setDescription] = useState(taskData.description || '');
    const [users, setUsers] = useState([]);

    const hasRights = getCookie('role') != 'guest';
    const quillRef = useRef(null); // Ссылка на редактор

    useEffect(async () => {
        if (!isOpen) return;
        
        const detail = await Task.getById(task.id)
        detail.assigneeName = task.assigneeName
        detail.authorName = task.authorName

        console.log(detail)

        setTaskData(detail);
        setTitle(detail.title);
        setDescription(detail.description || '');
    }, [isOpen]);


    useEffect(async () => {
        if (!isOpen) return;

        const users = await User.getAll()
        setUsers(users)
    }, [isOpen])

    const updateDescription = () => {
        Task.changeDescription(taskData.id, description)
    }

    // 
    const handleTitleChange = (e) => {
        if (e.key === 'Enter') {
            Task.rename(taskData.id, title)
            setIsEditing(false);
        }
    };

    const deleteTask = async () => {
        await Task.delete(taskData.id)
        onRemove()
    }

    const updateColumn = async (idx) => {
        await Task.move(taskData.id, idx, 0)
        onUpdateNeeded()
    }

    const updateAssignee = async (idx) => {
        await Task.changeResponsible(taskData.id, idx)
        onUpdateNeeded()
    }

    // Обновление дедлайна
    const updateDeadline = (deadlineDay) => {
        console.log(new Date(deadlineDay))
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-main">
                    {isEditing ? (
                        <input
                            type="text"
                            defaultValue={taskData.title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleTitleChange}
                            onBlur={() => setIsEditing(false)}
                            autoFocus
                        />
                    ) : (
                        <h2 style={{marginTop: "5px"}} onClick={() => setIsEditing(true)}>{title}</h2>
                    )}

                    <ReactQuill
                        ref={quillRef}
                        value={description}
                        readOnly={!hasRights}
                        onChange={setDescription}
                        modules={Modal.modules}
                        formats={Modal.formats}
                    />
                    {hasRights && <button className="task-button font-inter" onClick={updateDescription}>Сохранить изменения</button>}
                </div>
                <div className="modal-actions">
                    <ul>
                        <li>
                            <p className="font-semibold">Автор:</p>
                            <p>{taskData.authorName}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Дата создания:</p>
                            <p>{formatDate(taskData.created_at)}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Дата изменения:</p>
                            <p>{formatDate(taskData.updated_at)}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Дедлайн:</p>
                            <DeadlineRow isEditing={isEditingDeadline} setIsEditing={setIsEditingDeadline} deadlineValue={taskData.deadline} onEdited={(val) => updateDeadline(val)} />
                        </li>
                        <li>
                            <p className="font-semibold">Исполнитель:</p>
                            <select className = "task_modal_choice"
                                id="user"
                                value={taskData.assignee}
                                onChange={(e) => updateAssignee(e.target.value)}
                            >
                                {users.map((user) => {
                                    return (
                                        <option value={user.id}>
                                            {user.fullname}
                                        </option>
                                    );
                                })}
                            </select>
                        </li>
                        <li>
                            <p className="font-semibold">Статус задачи:</p>
                            <select className = "task_modal_choice"
                                id="role"
                                value={taskData.column}
                                onChange={(e) => updateColumn(e.target.value)}
                            >
                                {board.map((column) => {
                                    return (
                                        <option value={column.id}>
                                            {column.title}
                                        </option>
                                    );
                                })}
                            </select>
                        </li>
                        {hasRights && <li>
                            <button className="task-button font-inter" onClick={deleteTask}>Удалить таск</button>
                        </li>}

                    </ul>
                </div>
            </div>
        </div>
    );
};

Modal.modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'],
        [{ 'color': [] }, { 'background': [] }], // Добавляем возможность выбора цвета текста и фона
        ['clean'] // убрать форматирование
    ],
};

Modal.formats = [
    'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'image', 'color', 'background'
];