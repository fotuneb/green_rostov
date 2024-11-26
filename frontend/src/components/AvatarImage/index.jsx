import { React, useState, useEffect } from "react";
import { User, Attachment } from "../../utilities/api";
import "./index.css"

function getFallbackAvatarString(name) {
    let words = name.split(/\s+/).map(word => word.toUpperCase());
    words = words.slice(0, 2);
    return words.map(word => word[0]).join('');
  }

function AvatarImage({ userId }) {
    const [avatarData, setAvatarData] = useState({})

    useEffect(async () => {
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

    }, [avatarData])

    const {attachmentId, fallbackStr} = avatarData

    if (attachmentId) {
        return (
            <div className="avatar">
                <img src={Attachment.getURL(attachmentId)} alt="" />
            </div>
        )
    }

    return (
        <div className="avatar">
            {fallbackStr}
        </div>
    ) 
}

export default AvatarImage
