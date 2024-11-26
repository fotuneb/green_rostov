import React, { useEffect, useState } from 'react';
import { ManageUserModal } from "../../components/ManageUserModal";
import { useLocation } from "react-router-dom";
import { User } from '../../utilities/api';

import './admin.css';

const fetchUsers = async () => {
    const users = await User.getAll()
    let data = []

    for (const user of users) {
        if (user.role === 'admin') {
            continue;
        }

        data.push(user)
    }

    return data
}

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const location = useLocation();

    // Получение данных о юзере
    useEffect(() => {
        const getUsers = async () => {
            const userList = await fetchUsers();
            setUsers(userList);
        };
        getUsers();
    }, []);

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = (user) => {
        setSelectedUser(user)
        setModalOpen(true)
    };
    const closeModal = () => setModalOpen(false);

    // Проверяем, находится ли пользователь на странице /admin
    const isAdminPage = location.pathname === "/admin";

    return (
        <>
            <div className="admin-container font-inter">
                <ManageUserModal 
                isOpen={isModalOpen} 
                selectedUser={selectedUser} 
                onClose={closeModal}
                isAdminPage={isAdminPage} />
            <h1 className = "Admin_page_h">Страница администрирования</h1>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ФИО:</th>
                        <th>Роль:</th>
                        <th>Действия:</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.fullname}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="admin-button" onClick={() => openModal(user)}>Редактировать</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
       
    );
};

export default Admin;
