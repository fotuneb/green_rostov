
import React, { useState, useEffect } from 'react';
import "./user_profile_modal.css"
import { getCookie } from '../../utilities/cookies.js';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../utilities/api.js'

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

    const handleTgBot = async () => {
        const data = await User.getTelegramLink(getCookie('user_id'))
        window.open(data.telegram_link)
    }

    // Получение аватарки пользователя по эндпоинту
    const fetchAvatar = async () => {
        const data = await fetch('/api/avatar/?user_id=' + getCookie('user_id'), {
            method: "GET"
        })

        return await data.json();
    }

    // Получение пути к аватарке пользователя 
    const getAvatarPath = async () => {
        const data = await fetchAvatar();
        console.log(data);
    }

    getAvatarPath();

    useEffect(() => {
        if (userInfo.fullname !== '' || userInfo.about !== '')
            return

        User.getById(getCookie('user_id')).then((myData) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        User.changePublicInfo(userInfo)

        if (passwords.newPassword === '')
            return closeModal()

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Пароли не совпадают!')
            return
        }

        try {
            await User.changePassword(passwords.currentPassword, passwords.newPassword)
            setError('')
        }
        catch (error) {
            console.log((111))
            setError(error + '');
        }
    };

    return (
        <div className="font-inter">
            <h1 className="text-center">Редактировать профиль</h1>
            <form onSubmit={handleSubmit}>
                <div className="avatar">
                    <button className="user-profile-save user-profile-avatar-btn font-inter" type="submit">
                        Установить аватарку
                    </button>
                    {/* <img src={getAvatarPath} alt="Аватарочка...." /> */}
                </div>
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
                <button className="user-profile-save font-inter" style={{marginBottom: "15px"}} onClick={handleTgBot}>Перейти к Telegram-боту</button>
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
