import React, { useState, useEffect } from 'react';
import { User, Comments } from "../../utilities/api.js";
import AvatarImage from "../AvatarImage"
import { getCookie } from '../../utilities/cookies.js';
import "./task_comment.css"

// Форматирование даты публикации коммента
function formatPublishDate(datePosted) {
    // Создаем базовый объект даты
    const date = new Date(datePosted);

    // Форматируем дату в нужный вид
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Добавляем ведущий ноль
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // Итоговая сформатированная дата
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Компонент для отдельного коммента к таске
export default function TaskComment (props) {
    const [user, setUser] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [oldText, setOldText] = useState(props.description.replace("<p>", "").replace("</p>", ""));
    const [description, setDescription] = useState(props.description.replace("<p>", "").replace("</p>", ""));

    // Получаем объект нашего юзера
    useEffect(() => {
        User.getById(props.userId).then(setUser); 
    }, [])

    // Права на удаление коммента
    const isAdmin = getCookie('role') === 'admin';
    const isCommentAuthor = parseInt(getCookie('user_id')) === props.userId;
   
    // Метод для обновления содержимого комментария
    const updateCommentDescription = async () => {
        // Останавливаем редактирование
        setIsEditing(false); 
        // Очищаем стейт от старых значений
        setOldText('');
        // Получение и сохранение старого текста в состояние
        Comments.getCommentDescription(props.commentId)
        .then((comment) => setOldText(comment.text.replace('<p>', '').replace('</p>', '')))
        .catch((error) => console.log(`Ошибка при получении старого содержимого комментария: ${error}`));
        // Если поле пустое, то оставляем старое содержимое без запроса к серверу
        if (description === '') {
            setDescription(oldText);
            return;
        }
        // Если новое содержимое осталось таким же, то так же оставляем без лишнего запроса
        if (description === oldText) {
            return;
        }
        // Обновление описания
        await Comments.changeCommentDescription(props.commentId, description)
        // Ререндер списка комментариев
        if (props.onCommentEdited) {
            await props.onCommentEdited();
        }
    }

    // Обработчик удаления комментария
    const handleCommentDelete = async () => {
        try {
            await Comments.deleteComment(props.commentId);
            if (props.onCommentDeleted) {
                await props.onCommentDeleted(); // Обновляем комментарии
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
    const handleEditingComplete = async () => {
        await updateCommentDescription();
    }

    // Обработчик завершения редактирования через клавишу Enter
    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await updateCommentDescription();
        }
    }

    return (
        <div className="comment">
            <div className="comment-info">
                <div className="comment-user-info">
                    {user.id && <AvatarImage userId={user.id} />}
                    <span className="comment-author-element comment-author">{user.fullname}</span>
                    <span className="comment-author-element comment-date-posted">{formatPublishDate(props.datePosted)} </span>
                    <span className="comment-author-element comment-edited-flag" 
                          style={{display: props.isCommentEdited ? "inline" : "none"}}>(ред.)</span>
                </div>
                {/* Если редактирование, то поле, иначе сам текст коммента */}
                {!isEditing ? 
                <div className="comment-description">{description}</div>
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
                    !isEditing && isCommentAuthor && 
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
