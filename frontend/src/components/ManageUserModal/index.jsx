
import React, { useState } from 'react';
import { UserAdmin } from '../../utilities/api';
import "./manage_user_modal.css";

const EditProfile = ({ user, isAdminPage }) => {
    const [role, setRole] = useState(user.role);
    const [userFullname, setUserFullname] = useState(user.fullname);
    const [curError, setCurError] = useState('');


    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (user.fullname !== userFullname)
            UserAdmin.changeFullname(user.id, userFullname)

        if (user.role !== role)
            UserAdmin.changeRole(user.id, role)

        const { newPassword, confirmPassword } = passwords
        if (newPassword == '') {
            return;
        }

        if (newPassword !== confirmPassword) {
            return setCurError('Пароли не совпадают!');
        }

        setCurError('');

        UserAdmin.changePassword(user.id, newPassword)
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
                <button className="user-profile-save font-inter" type="submit">Сохранить изменения</button>
                {
                    !isAdminPage && <button className="user-profile-save font-inter">Перейти к Telegram-боту</button>
                }
            </form>
        </div>
    );
};


export const ManageUserModal = ({ isOpen, onClose, selectedUser, isAdminPage }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content manage-user-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile user={selectedUser} isAdminPage={isAdminPage} />
            </div>
        </div>
    );
};
