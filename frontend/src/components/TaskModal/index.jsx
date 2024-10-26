import React from 'react';
import './task_modal.css';

export const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-main">
                    <h2>Основной контент</h2>
                    <p>Здесь будет ваш основной контент.</p>
                </div>
                <div className="modal-actions">
                    <h3>Действия</h3>
                    <ul>
                        <li>Автор</li>
                        <li>Исполнитель</li>
                        <li>Статус задачи</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
