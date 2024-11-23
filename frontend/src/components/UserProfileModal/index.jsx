
import React, { useState, useEffect } from 'react';
import "./user_profile_modal.css"
import { getCookie } from '../../utilities/cookies.js';
import { Link, useNavigate } from 'react-router-dom';

const EditProfile = ({closeModal}) => {
    const [userInfo, setUserInfo] = useState({
        fullname: '',
        about: '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const getMyData = async () => {
        const data = await fetch('/api/get_user/' + getCookie('user_id'), {
            method: "GET"
        })

        return await data.json()
    }

    // Обработчик перехода к тг-боту
    const handleTgBot = async () => {
        const data = await fetch('/api/tg-link/?user_id=' + getCookie('user_id'), {
            method: "GET"
        })

        const response = data.json();

        response.then((data) => {
            window.open(data.telegram_link)
        })
    }

    useEffect(() => {
        if (userInfo.fullname !== '' || userInfo.about !== '')
            return

        getMyData().then((myData) => {

            setUserInfo({
                fullname: myData.fullname,
                about: myData.about
            })
        })
    }, [userInfo])

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

        fetch('/api/users/change-info', {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + getCookie('token'),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userInfo)
        })

        if (passwords.newPassword === '')
            return closeModal()

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Пароли не совпадают!')
            return
        }

        const processResponse = async (res) => {
            if (res.status === 200)
                return closeModal()

            const json = await res.json()
            setError(json.detail)
        }

        fetch('/api/users/change-password', {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + getCookie('token'),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                current_password: passwords.currentPassword,
                new_password: passwords.newPassword
            })
        }).then(processResponse)
    };

    return (
        <div className="font-inter">
            <h1 className="text-center">Редактировать профиль</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="user-profile-label">ФИО:</label>
                    <input
                        type="text"
                        name="fullname"
                        value={userInfo.fullname}
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
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button className="user-profile-save font-inter" type="submit">Сохранить изменения</button>
                <button className="user-profile-save font-inter" onClick={handleTgBot}>Перейти к Telegram-боту</button>
            </form>
        </div>
    );
};


export const UserProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile closeModal={onClose} />
            </div>
        </div>
    );
};
