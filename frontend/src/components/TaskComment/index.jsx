import React, { useState, useEffect } from 'react';
import { User, Attachment, Comments } from "../../utilities/api.js";
import { getCookie } from '../../utilities/cookies.js';
import "./task_comment.css"

// Компонент для отдельного коммента к таске
const TaskComment = (props) => {
    const [user, setUser] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(props.description.replace("<p>", "").replace("</p>", ""));

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

    // Обработчик редактирования комментария
    const handleEditing = async (e) => {
        setDescription(e.target.value);
    }

    // Обработчик завершения редактирования через клик вне поля
    const handleEditingComplete = () => {
        setIsEditing(false);
    }

    // Обработчик завершения редактирования через клавишу Enter
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setIsEditing(false); 
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
                {/*  */}
                {!isEditing ? 
                <div className="comment-description" dangerouslySetInnerHTML={{ __html: description }}></div>
                : <input type='text' 
                         value={description} 
                         onChange={handleEditing}
                         onBlur={handleEditingComplete}
                         onKeyDown={handleKeyDown}></input>}
                        
            </div>
            <div className="comment-controls">
                {/* Кнопка Редактировать отображается, когда пользователь в данный момент не редактирует коммент */}
                {/* Права доступа аналогичны кнопке Удалить */}
                {
                    !isEditing && (isAdmin || isCommentAuthor) && 
                    <button className="comment-action" onClick={(isEditing) => setIsEditing(isEditing)}>Редактировать</button>
                }
                {/* Удалять может либо сам пользователь свой коммент, либо админ может удалять любые комменты */}
                {
                    (isAdmin || isCommentAuthor) 
                    && <button className="comment-action" onClick={handleCommentDelete}>Удалить</button>
                }
            </div>
        </div>
    )
}

export default TaskComment