import React, { useState, useRef, useEffect } from 'react';
import { getCookie } from '../../utilities/cookies.js';
import ReactQuill from 'react-quill';
import { Task, User, Comments } from '../../utilities/api.js';
import { Tracker } from './Tracker/index.jsx';
import TaskComment from '../TaskComment/';
import AvatarImage from "../AvatarImage";
import 'react-quill/dist/quill.snow.css'; // Импорт стилей для редактора
import './task_modal.css';

// Метод для форматирования даты
const formatDate = (dateString, reversed, dayOnly) => {
    const date = new Date(dateString); // Преобразуем строку в объект Date

    // Получаем компоненты даты
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Формируем дату в нужном формате
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

// Функционал дедлайнов
const DeadlineRow = ({isEditing, setIsEditing, deadlineValue, onEdited}) => {
    const val = formatDate(deadlineValue, undefined, true)
    const [newValue, setNewValue] = useState(val)

    if (isEditing) {
        return (
            <>
            <input
                type="date"
                className="task-deadline-input"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
            />
            <button className="task-button font-inter" onClick={() => {
                onEdited(newValue); 
                setIsEditing(false)}
                }>
                    Сохранить
            </button>
            </>

        )
    }

    return (
        <p onClick={() => setIsEditing(true)}>
            {(deadlineValue && formatDate(deadlineValue)) || 'Не установлен (нажмите для редактирования)'}
        </p>
    )
}

// Основной компонент модального окна
export const Modal = ({ isOpen, onClose, task, onRemove, board, onUpdateNeeded }) => {
    const [taskData, setTaskData] = useState(task);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingDeadline, setIsEditingDeadline] = useState(false);
    const [title, setTitle] = useState(taskData.title);
    const [description, setDescription] = useState(taskData.description || '');
    const [users, setUsers] = useState([]);
    const [deadline, setDeadline] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [trackedTime, setTrackedTime] = useState(0)
    const [authorID, setAuthorID] = useState(null);

    const hasRights = getCookie('role') !== 'guest';
    const quillDescriptionRef = useRef(null); // Ссылка на редактор описания таски
    const commentInputRef = useRef(null); // Ссылка на редактор нового комментария

    // Получаем основные данные о таске
    useEffect(() => {
        async function fetchTaskData() {
            if (!isOpen) return;
        
            const detail = await Task.getById(task.id)
            detail.assigneeName = task.assigneeName
            detail.authorName = task.authorName
        
            setAuthorID(detail.author);
            setTaskData(detail);
            setTitle(detail.title);
            setDescription(detail.description || '');
            setDeadline(detail.deadline || '')
        }
        fetchTaskData();
    }, [isOpen]);

    // Установление юзера, прикрепленного к таске
    useEffect(() => {
        if (!isOpen) return;
        User.getAll().then(setUsers).catch(console.error);
    }, [isOpen])

    // Динамический ререндер даты изменения таски
    const renderTaskChangeDate = async () => {
         // Получаем обновленные данные задачи
         const task = await Task.getById(taskData.id)
         .catch(console.error);
    
         // Обновляем состояние taskData с новой датой
         setTaskData((prevState) => ({
             ...prevState, // Сохраняем остальные свойства объекта
             updated_at: task.updated_at, // Обновляем дату
         }));
    }

    useEffect(() => {
        setTrackedTime(taskData.total_tracked_time)
    }, [taskData.total_tracked_time])

    // Обновление описания таски
    const updateDescription = async () => {
        // Обновляем описание задачи
        await Task.changeDescription(task.id, description)
        .catch(console.error);
        // Ререндерим дату изменения таски
        await renderTaskChangeDate();
    }

    // Хэндлер для изменения заголовка таски
    const handleTitleChange = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            Task.rename(taskData.id, title)
            .catch(console.error);
            setIsEditing(false);
        }
    };

    // Удаление таски
    const deleteTask = async () => {
        await Task.delete(taskData.id)
        .catch(console.error);
        onRemove()
    }

    // Обновление колонки
    const updateColumn = async (idx) => {
        await Task.move(taskData.id, idx, 0)
        .catch(console.error);
        onUpdateNeeded()
        taskData.column_id = idx
        setTaskData(taskData)
    }

    // Обновление назначенного таске юзера
    const updateAssignee = async (idx) => {
        await Task.changeResponsible(taskData.id, idx)
        .catch(console.error)
        onUpdateNeeded()
        taskData.assignee = idx
        setTaskData(taskData)
        // Ререндерим дату изменения таски
        await renderTaskChangeDate();
    }

    // Обновление дедлайна
    const updateDeadline = async (deadlineDay) => {
        const [yyyy, mm, dd] = deadlineDay.split('-')
        const apiDeadlineString = `${dd}.${mm}.${yyyy} 00:00:00`

        // Запрос к базе на изменение дедлайна
        await Task.changeDeadline(taskData.id, apiDeadlineString).catch(console.error)

        // Очищаем предыдущий дедлайн
        setDeadline('');

        // Устанавливаем актуальный дедлайн
        setDeadline(`${yyyy}-${mm}-${dd}T00:00:00`)

        // Ререндерим дату изменения таски
        await renderTaskChangeDate();
    }

    // Метод для получения актуального списка комментариев
    const updateComments = async () => {
        // Получение всех комментариев с базы
        const res = await Comments.getAll(taskData.id)
        .catch(console.error);
        // Очистка предыдущего списка комментариев
        setComments('');
        // Установление актуального списка комментариев
        setComments(res);
        // Для проверки очищаем поле ввода для комментариев
        setNewComment('');
    }

    // Обработка ввода в поле для нового комментария
    const handleCommentInputChange = async (e) => {
        setNewComment(e.target.value);
    }

    // Публикация нового коммента в таске
    const publishComment = async () => {
        // Если поле коммента пустое, выходим
        if (newComment === '') return null;
        // Добавляем новый комментарий
        await Comments.addNewComment(newComment, getCookie('user_id'), taskData.id).catch(console.error);
        // Обновляем список комментов
        await updateComments();
    }

    // Обработка ввода нового комментария
    const publishCommentEnter = async (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            await publishComment();
        }
    }

    // Получение комментариев
    useEffect(() => {
        if (!isOpen) return null;
        Comments.getAll(taskData.id).then(setComments);
    }, [isOpen])

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
                        placeholder="Введите описание задачи"
                        ref={quillDescriptionRef}
                        value={description}
                        readOnly={!hasRights}
                        onChange={setDescription}
                        modules={Modal.modules}
                        formats={Modal.formats}
                    />
                    {hasRights && <button className="task-button font-inter" onClick={updateDescription}>Сохранить изменения</button>}
                    <div className="comments">
                        <h3>Комментарии</h3>
                        <div className="comment-write">
                            {hasRights && <input type="text" 
                                            className="comment-input"
                                            id="comment-input"
                                            value={newComment}
                                            readOnly={!hasRights}
                                            onChange={handleCommentInputChange}
                                            onKeyDown={publishCommentEnter}
                                            placeholder="Введите комментарий"
                                            ref={commentInputRef} />}
                            {hasRights && <button className="task-button font-inter" onClick={publishComment}>Добавить комментарий</button>}
                        </div>
                        {!comments.length ? 
                        (<p style={{margin: "0"}}>{
                            hasRights ? "Напишите первым мнение о задаче..." : "Нет комментариев"
                        }</p>) 
                        : comments
                            .sort((a, b) => new Date(b.create_date) - new Date(a.create_date))
                            .map((comment) => {
                            return (
                                <>
                                    <TaskComment 
                                        isCommentEdited={comment.is_edited}
                                        commentId={comment.id}
                                        userId={comment.author_id}
                                        datePosted={comment.create_date}
                                        description={comment.text}
                                        onCommentDeleted={updateComments}
                                        onCommentEdited={updateComments}
                                    />
                                </>
                            )
                        })}
                    </div>
                </div>
                <div className="modal-actions">
                    <Tracker trackedTime={trackedTime} setTrackedTime={setTrackedTime} taskId={taskData.id} />
                    <ul>
                        <li>
                            <p className="font-semibold">Автор:</p>
                            <div className="task-author-data-wrapper">
                                <div className="task-author-data">
                                    {<AvatarImage userId={authorID} />} 
                                    <span class="task-author-name">{taskData.authorName}</span>
                                </div>
                            </div>
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
                            <DeadlineRow isEditing={isEditingDeadline} setIsEditing={setIsEditingDeadline} deadlineValue={deadline} onEdited={updateDeadline} />
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