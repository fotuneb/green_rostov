import React, { useEffect, useState } from 'react';
import { ManageUserModal } from "../../components/ManageUserModal";
import { useLocation } from "react-router-dom";
import { User } from '../../utilities/api';
import './admin.css';

// Страница админки
const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [isModalOpen, setModalOpen] = useState(false);
    const [isUpdate, setIsUpdate] = useState(false);
    const location = useLocation();

    // Функция для получения списка юзеров
    const getUsers = async () => {
        const users = await User.getAll()
        let userList = []
        for (const user of users) {
            if (user.role === 'admin') {
                continue;
            }
            userList.push(user)
        }
        setUsers(userList);
    };

    // Получение данных о юзере
    useEffect(() => {
        getUsers();
    }, []);

    // Если нужно обновить таблицу после изменений
    // в модальном окне
    useEffect(() => {
        if (isUpdate) {
            console.log("Обновление списка пользователей...");
            getUsers();
            setIsUpdate(false); // Сбрасываем флаг
        }
    }, [isUpdate])

    // Открытие модального окна
    const openModal = (user) => {
        setSelectedUser(user)
        setModalOpen(true)
    };

    // Закрытие модального окна
    const closeModal = () => setModalOpen(false);

    // Функционал кнопки "Экспорт в Excel"
    const excelExport = () => {
        window.location.href = process.env.REACT_APP_PUBLIC_URL + '/export/board';
    }

    // Функционал кнопки "Создать нового юзера"
    const createNewUser = () => {
        return;
    }

    // Проверяем, находится ли пользователь на странице /admin
    const isAdminPage = location.pathname === "/admin";

    return (
        <div className="admin-container font-inter">
                <ManageUserModal 
                    isOpen={isModalOpen} 
                    selectedUser={selectedUser} 
                    onClose={closeModal}
                    isAdminPage={isAdminPage} 
                    setUsers={users}
                    isUpdate={isUpdate}
                    setIsUpdate={setIsUpdate}
                />
            <h1 className = "Admin_page_h">Страница администрирования</h1>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Псевдоним:</th>
                        <th>Роль:</th>
                        <th>Логин:</th>
                        <th>Действия:</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                        <td>{user.fullname}</td>
                        <td>{user.role}</td>
                        <td>{user.login}</td>
                        <td>
                            <button className="admin-button" onClick={() => openModal(user)}>Редактировать</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <div className="admin-custom-actions">
                <button className="admin-button" onClick={excelExport}>Экспортировать доску в Excel</button>
                {/* <button className="admin-button" onClick={createNewUser}>Создать нового юзера</button> */}
            </div>
        </div>     
    );
};

export default Admin;
