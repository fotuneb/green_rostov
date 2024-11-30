import React, { useState, useEffect } from 'react';
import { User } from "../../utilities/api.js";
import "./task_comment.css"

// Компонент для отдельного коммента к таске
const TaskComment = (props) => {
    const [user, setUser] = useState([]);

    // Получаем объект нашего юзера
    useEffect(() => {
        User.getById(props.userId).then(setUser); 
    }, [])

    // Форматируем описание 
    const description = props.description.replace("<p>", "").replace("</p>", "")

    // Форматируем дату
    const date = new Date(props.datePosted);
    const formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');

    return (
        <div className="comment">
            <div className="comment-user-info">
                <div className="comment-avatar"><img src={`/api/attachments/${user.avatar_id}`} alt="Аватарка..." /></div>
                <span className="comment-author">{user.fullname}</span>
                <span className="comment-date-posted"> {formattedDate}</span>
            </div>
            <div className="comment-description">{description}</div>
        </div>
    )
}

export default TaskComment