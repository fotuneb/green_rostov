import React, { useState } from 'react';
import { User } from "../../utilities/api.js";
import { handleError } from "../../utilities/helpers.js"; 
import "./create_new_user_modal.css";

// Основа компонента модального окна для создания нового юзера в админке
const EditNewUser = ({ closeModal }) => {
    const [fullname, setFullname] = useState(null);
    const [login, setLogin] = useState(null);
    const [curError, setCurError] = useState('');

    // Стейт для управления ввода пароля
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ""
    })

    // Коллбэк для управления ввода паролей
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
    }

    // Обработка события отправки формы на создание нового юзера
    const handleSubmit = async () => {
        try {
            await User.create(fullname, login, passwords.password)
            closeModal();
        } catch (e) {
            console.error("Не удалось создать нового юзера:", e)
            setCurError(true);
        }
    }

    return (
        <div className="font-inter">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="create-new-user-label">
                        ФИО:
                    </label>
                    <input
                        type="text"
                        name="fullname"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="create-new-user-label">
                        Логин:
                    </label>
                    <input
                        type="text"
                        name="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <label className="create-new-user-label">
                        Пароль:
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={passwords.password}
                        onChange={handlePasswordChange}
                    />
                </div>
                <div className="input-group">
                    <label className="create-new-user-label">
                        Подтвердите пароль:
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                    />
                </div>
                {curError && <p className="error-message">{curError}</p>}
                <button
                    className="create-new-user-save font-inter"
                    type="submit" // Закрытие модального окна
                >
                    Создать пользователя
                </button>
            </form>
        </div>
    );
}

// Обертка для компонента EditNewUser
export const CreateNewUserModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-user-modal-content" onClick={(e) => e.stopPropagation()}>
                <EditNewUser closeModal={onClose} isOpen={isOpen} />
            </div>
        </div>
    );
};