import React, { useState } from 'react';

// Компонент модального окна для создания нового юзера в админке
const EditNewUser = ({ closeModal }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <div className="font-inter">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="user-profile-label">ФИО:</label>
                    <input
                        type="text"
                        name="name"
                        value={userFullname}
                        onChange={(e) => setUserFullname(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="user-profile-label" htmlFor="role">Роль:</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="guest">Гость</option>
                        <option value="manager">Редактор</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="user-profile-label">
                        Новый пароль:
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordChange}
                    />
                </div>
                <div className="input-group">
                    <label className="user-profile-label">
                        Подтвердите новый пароль:
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                    />
                </div>
                {curError && <p className="error-message">{curError}</p>}
                <button
                    className="user-profile-save font-inter"
                    type="submit" // Закрытие модального окна
                >
                    Сохранить изменения
                </button>
                {
                    !isAdminPage && (
                        <button
                            className="user-profile-save font-inter"
                            type="button" // Предотвращает отправку формы
                        >
                            Перейти к Telegram-боту
                        </button>
                    )
                }
            </form>
        </div>
    );
}

export const CreateNewUserModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <EditNewUser closeModal={onClose} />
            </div>
        </div>
    );
};