import React, { useEffect, useState } from 'react';
import { ManageUserModal } from "../../components/ManageUserModal";
import { CreateNewUserModal } from '../../components/CreateNewUserModal';
import { useLocation } from "react-router-dom";
import { User } from '../../utilities/api';
import './admin.css';

// Страница админки
const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [isModalEditOpen, setModalEditOpen] = useState(false);
    const [isModalNewUserOpen, setModalNewUserOpen] = useState(false);
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
    }

    useEffect(() => {
        getUsers(); // Изначальное получение списка юзеров

        // Если нужно обновить таблицу после изменений
        // в модальном окне
        if (isUpdate) {
            getUsers();
            setIsUpdate(false); // Сбрасываем флаг
        }
    }, [isUpdate])

    // Открытие модального окна
    const openEditModal = (user) => {
        setSelectedUser(user)
        setModalEditOpen(true)
    };

    // Закрытие модального окна для редактирования данных пользователя
    const closeEditModal = () => setModalEditOpen(false);

    // Коллбэки для управления состоянием модального окна для создания юзера
    const openNewUserModal = () => setModalNewUserOpen(true);
    const closeNewUserModal = () => setModalNewUserOpen(false);

    // Функционал кнопки "Экспорт в Excel"
    const excelExport = () => {
        window.location.href = process.env.REACT_APP_PUBLIC_URL + '/export/board';
    }

    // Проверяем, находится ли пользователь на странице /admin
    const isAdminPage = location.pathname === "/admin";

    return (
        <div className="admin-container font-inter">
                <ManageUserModal 
                    isOpen={isModalEditOpen} 
                    selectedUser={selectedUser} 
                    onClose={closeEditModal}
                    isAdminPage={isAdminPage} 
                    setUsers={users}
                    isUpdate={isUpdate}
                    setIsUpdate={setIsUpdate}
                />
                <CreateNewUserModal 
                    isOpen={isModalNewUserOpen}
                    onClose={closeNewUserModal}
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
                            <button className="admin-button" onClick={() => openEditModal(user)}>Редактировать</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <div className="admin-custom-actions">
                <button className="admin-button" onClick={excelExport}>Экспортировать доску в Excel</button>
                <button className="admin-button" onClick={openNewUserModal}>Создать нового юзера</button>
            </div>
        </div>     
    );
};

export default Admin;
