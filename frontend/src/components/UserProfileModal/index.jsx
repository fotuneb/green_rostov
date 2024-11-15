
import React, { useState } from 'react';
import "./user_profile_modal.css"

const EditProfile = () => {
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
            <h1 className="text-center">Редактировать профиль</h1>
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
                    <label className="user-profile-label">
                        О себе:
                    </label>
                    <input
                        type="text"
                        name="about"
                        value={userInfo.about}
                        onChange={handleUserInfoChange}
                        required
                    />
                </div>
                <h2 className="text-center">Изменение пароля</h2>
                <div className="input-group">
                    <label className="user-profile-label">
                        Текущий пароль:
                    </label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handlePasswordChange}
                    />
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
                <button className="user-profile-save font-inter" type="submit">Сохранить изменения</button>
            </form>
        </div>
    );
};


export const UserProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile />
            </div>
        </div>
    );
};
