import React, { useState, useEffect, useRef } from 'react';
import "./user_profile_modal.css"
import { getCookie } from '../../utilities/cookies.js';
import { User } from '../../utilities/api.js';
import AvatarInput from "../AvatarInput";
import AvatarImage from "../AvatarImage";
import "./user_profile_modal.css"

// Компонент модального окна для изменения данных о юзере
const EditProfile = ({closeModal}) => {
    // Группа стейтов для аватарки
    const fileRef = useRef(null);
    const [avatarImage, setAvatarImage] = useState(null);
    const [isUserModal, setIsUserModal] = useState(true);

    // Текущий юзер
    const [user, setUser] = useState([]);

    // Получаем объект нашего юзера
    useEffect(() => {
        User.getById(getCookie('user_id')).then(setUser); 
    }, [])

    const [userInfo, setUserInfo] = useState({
        fullname: '',
        about: '',
    });

    // Установление паролей
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Получение аватарки
    const [error, setError] = useState('');

    // Обработка перехода на тг-бота
    const handleTgBot = async () => {
        const data = await User.getTelegramLink(getCookie('user_id'))
        window.open(data.telegram_link)
    }

    // Установление данных о юзере
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

    // Обработка смены информации о юзере
    const handleUserInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    // Обработка смены пароля
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    // Сохранение нового аватарки
    const saveNewAvatar = async () => {
        const userID = getCookie("user_id");
        const file = fileRef.current.files[0];

        if (!file) {
            setError("Файл не выбран");
            return;
        }

        try {
            await User.changeAvatar(userID, file);
            setError(""); // Очищаем ошибку
            console.log("Аватарка обновлена успешно!");
        } catch (err) {
            console.error("Ошибка загрузки аватарки:", err);
            setError("Не удалось загрузить аватарку");
        }
    }

    // Обработка сохранения изменений в форме
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Сохранение аватарки
        saveNewAvatar();

        // Сохранение данных полей "Псевдоним" и "О себе"
        await User.changePublicInfo(userInfo);
        
        if (passwords.newPassword === '')
            return closeModal();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Пароли не совпадают!')
            return
        }

        // Смена пароля пользователя
        try {
            await User.changePassword(passwords.currentPassword, passwords.newPassword)
            setError('')
        }
        catch (error) {
            setError(error + '');
        }
    };

    return (
        <div className="font-inter model-content-wrapper">
            <h1 className="text-center user-profile-modal-main-title">Редактировать профиль</h1>
            <form onSubmit={handleSubmit} className="user-profile-modal-form">
                <div className="avatar-block">
                    {user.id && <AvatarImage userId={user.id} localImage={avatarImage} isUserModal={isUserModal} />}
                </div>
                <AvatarInput ref={fileRef} 
                             setImage={setAvatarImage}
                             />
                <div className="input-group">
                    <label className="user-profile-label">Псевдоним:</label>
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
