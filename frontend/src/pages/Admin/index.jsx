import React, { useEffect, useState } from 'react';
import './admin.css'; // Импорт стилей

const fetchUsers = async () => {
    // Заглушка для получения списка пользователей
    return [
        { id: 1, fullName: 'Иванов Иван', username: 'ivanov' },
        { id: 2, fullName: 'Петров Петр', username: 'petrov' },
        { id: 3, fullName: 'Сидоров Сидор', username: 'sidorov' },
    ];
};

const Admin = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getUsers = async () => {
            const userList = await fetchUsers();
            setUsers(userList);
        };
        getUsers();
    }, []);

    const handleEdit = (userId) => {
        // Логика редактирования пользователя
        console.log(`Редактирование пользователя с ID: ${userId}`);
    };

    return (
        <div className="admin-container">
            <h1>Страница Администрирования</h1>
            <table className="user-table">
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Логин</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.fullName}</td>
                            <td>{user.username}</td>
                            <td>
                                <button onClick={() => handleEdit(user.id)}>Редактировать</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;
