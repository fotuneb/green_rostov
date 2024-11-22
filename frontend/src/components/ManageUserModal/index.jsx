
import React, { useState } from 'react';
import "./manage_user_modal.css";

const ws = process.env.REACT_APP_PUBLIC_URL;

const updateFullname = async (token, userId, fullname) => {
    const response = await fetch(ws + "/api/users/admin/change-fullname/" + userId + '?new_fullname=' + fullname, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
    });

    return await response.json()
}

const updateRole = async (token, userId, role) => {
    const response = await fetch(ws + "/api/users/admin/change-role/" + userId + '?new_role=' + role, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
    });

    return await response.json()
}

const updatePassword = async (token, userId, password) => {
    const response = await fetch(ws + "/api/users/admin/change-password/" + userId + '?new_password=' + password, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    });

    return await response.json();
}

const EditProfile = ({ user, token }) => {
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

        if (user.fullname !== userFullname) {
            updateFullname(token, user.id, userFullname);
        }

        if (user.role !== role) {
            updateRole(token, user.id, role);
        }

        const { newPassword, confirmPassword } = passwords
        console.log(newPassword, confirmPassword)
        if (newPassword == '') {
            return;
        }

        if (newPassword !== confirmPassword) {
            return setCurError('Пароли не совпадают!');
        }

        setCurError('');
        updatePassword(token, user.id, newPassword);
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
                {curError && <p style={{ color: 'red' }}>{curError}</p>}
                <button className="user-profile-save font-inter" type="submit">Сохранить изменения</button>
                <button className="user-profile-save font-inter">Связать с Telegram-ботом</button>
            </form>
        </div>
    );
};


export const ManageUserModal = ({ isOpen, onClose, selectedUser, token }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content manage-user-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile user={selectedUser} token={token} />
            </div>
        </div>
    );
};
