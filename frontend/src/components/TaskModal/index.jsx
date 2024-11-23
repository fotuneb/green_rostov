import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Импорт стилей для редактора
import './task_modal.css';

const ws = process.env.REACT_APP_PUBLIC_URL

const formatDate = (dateString) => {
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

export const Modal = ({ isOpen, onClose, task, onRemove, board, onUpdateNeeded }) => {
    const [taskData, setTaskData] = useState(task);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(taskData.title);
    const [description, setDescription] = useState(taskData.description || '');
    const [users, setUsers] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({
        author: '',
        executor: '',
        status: '',
    });

    const hasRights = localStorage.getItem('role') != 'guest';


    const quillRef = useRef(null); // Ссылка на редактор

    const getTaskDetail = async () => {
        const det = await fetch(`${ws}/api/task/${task.id}`)
        return await det.json();
    }

    useEffect(() => {
        if (!isOpen) return;
        getTaskDetail().then((data) => {
            data.assigneeName = task.assigneeName
            data.authorName = task.authorName

            setTaskData(data);
            setTitle(data.title);
            setDescription(data.description || '');
        });
    }, [isOpen]);


    useEffect(() => {
        if (!isOpen) return;

        fetch(`${ws}/api/get_users`).then((res) => {
            res.json().then((data) => {
                setUsers(data)
            })
        })
    }, [isOpen])

    const updateTitle = () => {
        fetch(`/api/task/rename`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                id: taskData.id,
                new_title: title
            })
        });
    }

    const updateDescription = () => {
        fetch(`/api/task/change_contents`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                id: taskData.id,
                desc: description
            })
        });
    }

    const handleTitleChange = (e) => {
        if (e.key === 'Enter') {
            updateTitle()
            setIsEditing(false);
        }
    };

    const deleteTask = () => {
        fetch(`${ws}/api/task/${taskData.id}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        }).then((res) => {
            res.json().then(onRemove)
        })
    }

    const updateColumn = (idx) => {
        fetch(`${ws}/api/tasks/move`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },

            body: JSON.stringify({
              task_id: taskData.id,
              new_column_id: idx,
              new_index: 0
            })
          }).then((res) => {
            res.json().then(onUpdateNeeded)
        })
    }

    const updateAssignee = (idx) => {
        fetch(`${ws}/api/tasks/change_responsible`, {
            method: "PUT",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },

            body: JSON.stringify({
              id: taskData.id,
              id_user: idx,
            })
          }).then((res) => {
            res.json().then(onUpdateNeeded)
        })
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                        <h2 onClick={() => setIsEditing(true)}>{title}</h2>
                    )}

                    <ReactQuill
                        ref={quillRef}
                        value={description}
                        readOnly={!hasRights}
                        onChange={setDescription}
                        modules={Modal.modules}
                        formats={Modal.formats}
                    />
                    {hasRights && <button className="quill-update-contents font-inter" onClick={updateDescription}>Обновить</button>}
                </div>
                <div className="modal-actions">
                    <ul>
                        <li>
                            <p className="font-semibold">Автор</p>
                            <p>{taskData.authorName}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Дата создания</p>
                            <p>{formatDate(taskData.created_at)}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Дата изменения</p>
                            <p>{formatDate(taskData.updated_at)}</p>
                        </li>
                        <li>
                            <p className="font-semibold">Исполнитель</p>
                            <select
                                id="user"
                                value={taskData.assignee_id}
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
                            <p className="font-semibold">Статус задачи</p>
                            <select
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
                            <button className="quill-update-contents font-inter" onClick={deleteTask}>Удалить</button>
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