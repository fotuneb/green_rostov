
import React, { useState, useEffect, useRef } from 'react';
import "./user_profile_modal.css"
import { getCookie, setCookie } from '../../utilities/cookies.js';
import { User, Avatar } from '../../utilities/api.js';
import AvatarInput from "../AvatarInput";

const EditProfile = ({closeModal}) => {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("Файл не выбран");
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

    // Обработка перехода на тг-бота
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

    // Обработка сохранения изменений в форме
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Отправка аватарки
        const userID = getCookie('user_id');
        const file = fileRef.current.files[0];
        const data = await Avatar.sendFile(userID, file);
        
        // Запись пути к аватарке в куки
        setCookie("avatar_attachments_id", data["id"])
        setCookie("avatar_link", data['file_path']);
        console.log(getCookie('avatar_link'));
        // const attach = await Avatar.getFile();
        
        // // Преобразуем ответ в Blob и создаем URL
        // const blob = await attach.blob();
        // const imageUrl = URL.createObjectURL(blob);
        // console.log(imageUrl);

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
        <div className="font-inter model-content-wrapper">
            <h1 className="text-center">Редактировать профиль</h1>
            <form onSubmit={handleSubmit}>
                <div className="avatar">
                    <AvatarInput fileName={fileName} setFileName={setFileName} ref={fileRef} />
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
