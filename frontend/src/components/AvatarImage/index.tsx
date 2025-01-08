import { useState, useEffect, FC } from "react";
import { User, Attachment } from "@api";
import { UserObjectAPIResponse } from "@api/user/types";
import { getFallbackAvatarString } from "@utils/helpers";
import "./index.css"

type AvatarImageProps = {
    userId: number
    localImage?: string | null
    isUserModal?: boolean
    rerender?: boolean 
}  

type AvatarDataObject = {
    attachmentId?: number | null
    fallbackStr?: string | null
}

// Компонент для вывода изображения
const AvatarImage: FC<AvatarImageProps> = ({ userId, localImage, isUserModal, rerender }) => {
    const [avatarData, setAvatarData] = useState<AvatarDataObject>({})

    // Получаем изначальные данные для аватарки
    // При установлении флага rerender производим ререндер аватарки
    useEffect(() => {
        fetchUserData();
    }, [userId, rerender])

    // Получение данных об аватарке
    const fetchUserData = async () => {
        const userData: UserObjectAPIResponse = await User.getById(userId)

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

    // Получаем ID вложения и строку-заглушку на случай его отсутствия
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
