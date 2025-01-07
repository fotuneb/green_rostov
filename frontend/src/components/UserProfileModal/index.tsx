import React, { useState, useEffect, useRef } from 'react';
import "./user_profile_modal.css"
import { getCookie } from '../../utilities/cookies.js';
import { User } from '../../utilities/api/user/user';
import { useAvatar } from '../../contexts/AvatarContext';
import AvatarInput from "../AvatarInput";
import AvatarImage from "../AvatarImage";
import "./user_profile_modal.css"

import type {
     UserPublicInfoObject,
     UserObjectAPIResponse, 
     UserTgLinkAPIResponse 
} from '../../utilities/api/user/types';

// Компонент модального окна для изменения данных о юзере
const EditProfile = ({closeModal}: boolean) => {
    // Группа стейтов для аватарки
    const fileRef = useRef<HTMLInputElement>(null);
    const [avatarImage, setAvatarImage] = useState(null);
    const [isUserModal, setIsUserModal] = useState(true);

    // Контекст для обновления аватара
    const { updateAvatar } = useAvatar();

    // Текущий юзер
    const [user, setUser] = useState<UserObjectAPIResponse>({});
    const userId = getCookie('user_id');

    // Получаем объект нашего юзера
    useEffect(() => {
        if (userId) {
            User.getById(userId).then(setUser); 
        }
    }, [])

    const [userInfo, setUserInfo] = useState<UserPublicInfoObject>({
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
        if (userId) {
            const data: UserTgLinkAPIResponse = await User.getTelegramLink(userId)
            window.open(data.telegram_link)
        }
    }

    // Установление данных о юзере
    useEffect(() => {
        if (userInfo.fullname !== '' || userInfo.about !== '' || !userId)
            return

        User.getById(userId).then((myData: UserObjectAPIResponse) => {
            const userPublicInfo: UserPublicInfoObject = {
                fullname: myData.fullname,
                about: myData.about
            }
            setUserInfo(userPublicInfo)
        }).catch(console.error);
    }, [userInfo])

    // Обработка смены информации о юзере
    const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    // Обработка смены пароля
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    };

    // Сохранение нового аватарки
    const saveNewAvatar = async () => {
        const file: File | null = fileRef.current?.files?.[0] || null;

        if (!file) {
            setError("Файл не выбран");
            return;
        }

        try {
            if (userId) {
                const avatarData = await User.changeAvatar(userId, file);
                updateAvatar(avatarData.id); // Обновляем контекст аватарки
                setError(""); // Очищаем ошибку
            }
        } catch (err) {
            console.error("Ошибка загрузки аватарки:", err);
            setError("Не удалось загрузить аватарку");
        }
    }

    // Обработка сохранения изменений в форме
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Сохранение аватарки
        saveNewAvatar();

        // Сохранение данных полей "Псевдоним" и "О себе"
        await User.changePublicInfo(userInfo).catch(console.error);
        
        if (passwords.newPassword === '')
            return closeModal();

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Пароли не совпадают!')
            return
        }

        // Смена пароля пользователя
        await User.changePassword(passwords.currentPassword, passwords.newPassword).catch(setError)
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

interface UserProfileModalProps {
    isOpen: boolean
    onClose: () => void
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content user-profile-modal" onClick={(e) => e.stopPropagation()}>
                <EditProfile closeModal={onClose} />
            </div>
        </div>
    );
};
 