import { React, useState, useEffect } from "react";
import { User, Attachment } from "../../utilities/api";
import "./index.css"

// Формирование строки-заглушки в случае отсутствия аватарки
function getFallbackAvatarString(name) {
    let words = name.split(/\s+/).map(word => word.toUpperCase());
    words = words.slice(0, 2);
    return words.map(word => word[0]).join('');
  }

// Компонент для вывода изображения
function AvatarImage({ userId, localImage, isUserModal }) {
    const [avatarData, setAvatarData] = useState({})

    // Получаем изначальные данные для аватарки
    useEffect(() => {
        async function fetchUserData() {
            const userData = await User.getById(userId)

            if (userData.avatar_id !== null) {
                setAvatarData({
                    attachmentId: userData.avatar_id,
                })
            }
            else {
                setAvatarData({
                    fallbackStr: getFallbackAvatarString(userData.fullname)
                })
            }
        }
        fetchUserData();
    }, [userId])

    const {attachmentId, fallbackStr} = avatarData

    // Если передано локальное изображение из сэндбокса
    if (localImage) {
        return (
            <div className={isUserModal ? "avatar-modal" : "avatar"}>
                <img src={localImage} alt="" />
            </div>
        )
    }

    // Если аватарка задана и получена с сервера
    if (attachmentId) {
        return (
            <div className={isUserModal ? "avatar-modal" : "avatar"}>
                <img src={Attachment.getURL(attachmentId)} alt="" />
            </div>
        )
    }

    // Состояние до выбора аватарки
    return (
        <div className={isUserModal ? "avatar-modal" : "avatar"}>
            {isUserModal ? <div className="no-avatar">Нет аватара</div> : fallbackStr}
        </div>
    ) 
}

export default AvatarImage
