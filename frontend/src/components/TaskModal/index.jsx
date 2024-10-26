import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Импорт стилей для редактора
import './task_modal.css';

export const Modal = ({ isOpen, onClose, task }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.content);
    const [description, setDescription] = useState('');
    const [selectedOptions, setSelectedOptions] = useState({
        author: '',
        executor: '',
        status: '',
    });
    const quillRef = useRef(null); // Ссылка на редактор

    const handleTitleChange = (e) => {
        if (e.key === 'Enter') {
            console.log('Новое значение заголовка:', title);
            setIsEditing(false);
        }
    };

    const handleOptionChange = (field, value) => {
        setSelectedOptions((prev) => ({ ...prev, [field]: value }));
        console.log(`${field}: ${value}`);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-main">
                    {isEditing ? (
                        <input
                            type="text"
                            value={title}
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