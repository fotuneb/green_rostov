import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Импорт стилей для редактора
import './task_modal.css';

const ws = process.env.REACT_APP_PUBLIC_URL

export const Modal = ({ isOpen, onClose, task }) => {
    const [taskData, setTaskData] = useState(task);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(taskData.title);
    const [description, setDescription] = useState(taskData.description || '');
    const [selectedOptions, setSelectedOptions] = useState({
        author: '',
        executor: '',
        status: '',
    });

    const quillRef = useRef(null); // Ссылка на редактор

    const getTaskDetail = async () => {
        const det = await fetch(`${ws}/api/task/${task.id}`)
        return await det.json();
    }

    useEffect(() => {
        if (!isOpen) return;
        getTaskDetail().then((data) => {
            setTaskData(data);
            setTitle(data.title);
            setDescription(data.description || '');
            console.log(data);
        });
    }, [isOpen]);

    const updateTitle = () => {
        fetch(`${ws}/api/task/rename/${taskData.id}?new_title=${title}`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
    }

    const updateDescription = () => {
        console.log(description)
        fetch(`${ws}/api/task/change_contents/${taskData.id}?desc=${description}`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
    }

    const handleTitleChange = (e) => {
        if (e.key === 'Enter') {
            updateTitle()
            setIsEditing(false);
        }
    };

    const handleOptionChange = (field, value) => {
        setSelectedOptions((prev) => ({ ...prev, [field]: value }));
    };

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
                        onChange={setDescription}
                        modules={Modal.modules}
                        formats={Modal.formats}
                    />

                    <button className="quill-update-contents font-inter" onClick={updateDescription}>Обновить</button>
                </div>
                <div className="modal-actions">
                    <h3>Меню</h3>
                    <ul>
                        <li>
                            Автор
                            <select onChange={(e) => handleOptionChange('author', e.target.value)}>
                                <option value="">Выберите автора</option>
                                <option value="Автор 1">Автор 1</option>
                                <option value="Автор 2">Автор 2</option>
                                <option value="Автор 3">Автор 3</option>
                            </select>
                        </li>
                        <li>
                            Исполнитель
                            <select onChange={(e) => handleOptionChange('executor', e.target.value)}>
                                <option value="">Выберите исполнителя</option>
                                <option value="Исполнитель 1">Исполнитель 1</option>
                                <option value="Исполнитель 2">Исполнитель 2</option>
                                <option value="Исполнитель 3">Исполнитель 3</option>
                            </select>
                        </li>
                        <li>
                            Статус задачи
                            <select onChange={(e) => handleOptionChange('status', e.target.value)}>
                                <option value="">Выберите статус</option>
                                <option value="В процессе">В процессе</option>
                                <option value="Завершено">Завершено</option>
                                <option value="Отложено">Отложено</option>
                            </select>
                        </li>
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