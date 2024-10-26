
import React, { useState } from 'react';
import "./manage_user_modal.css"

const EditProfile = () => {
    const [role, setRole] = useState('Гость');

    const [userInfo, setUserInfo] = useState({
        name: '',
        about: '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Логика отправки данных на сервер
        console.log('Информация пользователя:', userInfo);
        console.log('Пароли:', passwords);
    };

    return (
        <div className="font-inter">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="user-profile-label">ФИО:</label>
                    <input
                        type="text"
                        name="name"
                        value={userInfo.name}
                        onChange={handleUserInfoChange}
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
                        <option value="Гость">Гость</option>
                        <option value="Редактор">Редактор</option>
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
                        required
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
                        required
                    />
                </div>
                <button className="user-profile-save font-inter" type="submit">Сохранить изменения</button>
            </form>
        </div>
    );
};


export const ManageUserModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content manage-user-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile />
            </div>
        </div>
    );
};
