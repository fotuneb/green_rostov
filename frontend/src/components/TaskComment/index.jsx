import React from 'react'
import "./task_comment.css"

// Компонент для отдельного коммента к таске
const TaskComment = (props) => {
    return (
        <div className="comment">
            <div className="comment-user-info">
                <div className="comment-avatar"><img src={props.avatarUrl} alt="Аватарка..." /></div>
                <div className="comment-author">{props.userName}</div>
                <div className="comment-date-posted">{props.date}</div>
            </div>
            <div className="comment-description">{props.description}</div>
        </div>
    )
}

export default TaskComment