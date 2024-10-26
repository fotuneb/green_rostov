import React, { useEffect, useState } from 'react';
import { ManageUserModal } from "../../components/ManageUserModal"
import './admin.css'; // Импорт стилей

const fetchUsers = async () => {
    const ws = process.env.REACT_APP_PUBLIC_URL
    const response = await fetch(ws + "/api/get_users");

    const users = await response.json();
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

    return (
        <div className="admin-container font-inter">
            <ManageUserModal isOpen={isModalOpen} selectedUser={selectedUser} onClose={closeModal} />
            <h1>Страница администрирования</h1>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Роль</th>
                        <th>Действия</th>
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
    );
};

export default Admin;
