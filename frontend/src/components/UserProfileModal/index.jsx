
import React, { useState, useEffect, useRef } from 'react';
import "./user_profile_modal.css"
import { getCookie } from '../../utilities/cookies.js';
import { User } from '../../utilities/api.js';
import AvatarInput from "../AvatarInput";
import "./user_profile_modal.css"

// Компонент модального окна для изменения данных о юзере
const EditProfile = ({closeModal}) => {
    // Группа стейтов для аватарки
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("Файл не выбран");
    const [file, setFile] = useState(null);

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
            console.log("Объект юзера после обновления полей:", myData);
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
            setFileName(file.name); // Обновляем имя файла
            setFile(file);
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
            console.log("Ошибка смены пароля", error);
            setError(error + '');
        }
    };

    return (
        <div className="font-inter model-content-wrapper">
            <h1 className="text-center">Редактировать профиль</h1>
            <form onSubmit={handleSubmit}>
                <AvatarInput ref={fileRef} 
                         fileName={fileName} 
                         setFileName={setFileName} 
                         setFile={setFile} />
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
