import React, { useState } from 'react';
import { UserAdmin } from '../../utilities/api';
import { User } from "../../utilities/api.js";
import "./manage_user_modal.css";

// Компонент модального окна
const EditProfile = ({ user, isAdminPage, setUsers, closeModal, updateTable }) => {
    const [role, setRole] = useState(user.role);
    const [userFullname, setUserFullname] = useState(user.fullname);
    const [curError, setCurError] = useState('');

    // Стейт для установки паролей
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    // Обработка смены пароля
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    // Обработка сохранения изменений
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (user.fullname !== userFullname)
            UserAdmin.changeFullname(user.id, userFullname)

        if (user.role !== role)
            UserAdmin.changeRole(user.id, role)

        const { newPassword, confirmPassword } = passwords
        if (newPassword === '') {
            return;
        }

        if (newPassword !== confirmPassword) {
            return setCurError('Пароли не совпадают!');
        }

        setCurError('');

        UserAdmin.changePassword(user.id, newPassword)

        User.getAll().then(setUsers);

        // Обновление таблицы в админке
        await updateTable();

        // Закрытие модального окна после сохранения изменений
        closeModal();
    };

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
};


export const ManageUserModal = ({ isOpen, onClose, selectedUser, isAdminPage, setUsers, update }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content manage-user-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile 
                user={selectedUser} 
                isAdminPage={isAdminPage} 
                setUsers={setUsers} 
                closeModal={onClose} 
                updateTable={update} />
            </div>
        </div>
    );
};
