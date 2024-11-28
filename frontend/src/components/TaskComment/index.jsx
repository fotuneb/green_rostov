import React, { useState, useEffect } from 'react';
import { User, Attachment, Comments } from "../../utilities/api.js";
import { getCookie } from '../../utilities/cookies.js';
import "./task_comment.css"

// Компонент для отдельного коммента к таске
const TaskComment = (props) => {
    const [user, setUser] = useState([]);

    // Получаем объект нашего юзера
    useEffect(() => {
        User.getById(props.userId).then(setUser); 
    }, [])

    // Права на удаление коммента
    const isAdmin = getCookie('role') == 'admin';
    const isCommentAuthor = getCookie('user_id') == props.userId;

    // Получение пути к аватарке пользователя
    const avatarPath = Attachment.getURL(user.avatar_id);
    const isAvatarAvailable = !avatarPath.endsWith('null');

    // Форматируем описание 
    const description = props.description.replace("<p>", "").replace("</p>", "")

    // Форматируем дату
    const date = new Date(props.datePosted);
    const formattedDate = date.toISOString().slice(0, 16).replace('T', ' ');

    // Обработчик удаления комментария
    const handleCommentDelete = async () => {
        try {
            await Comments.deleteComment(props.commentId);
            if (props.onCommentDeleted) {
                props.onCommentDeleted(); // Обновляем комментарии
            }
        } catch (error) {
            console.error("Ошибка при удалении комментария:", error);
        }
    }

    return (
        <div className="comment">
            <div className="comment-info">
                <div className="comment-user-info">
                    <div className="comment-avatar">
                        {isAvatarAvailable && <img src={avatarPath} />}
                    </div>
                    <span className="comment-author">{user.fullname}</span>
                    <span className="comment-date-posted"> {formattedDate}</span>
                </div>
                <div className="comment-description">{description}</div>
            </div>
            {/* Удалять может либо сам пользователь свой коммент, либо админ может удалять любые комменты */}
            {
                (isAdmin || isCommentAuthor) 
                && <button className="comment-delete" onClick={handleCommentDelete}>Удалить</button>
            }
        </div>
    )
}

export default TaskComment