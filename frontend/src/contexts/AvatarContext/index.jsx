import React, { createContext, useState, useContext } from 'react';

// Создание контекста
const AvatarContext = createContext();

export const useAvatar = () => {
    return useContext(AvatarContext);
};

export const AvatarProvider = ({ children }) => {
    const [avatarData, setAvatarData] = useState(null); // Начальные данные для аватара

    const updateAvatar = (newAvatar) => {
        setAvatarData(newAvatar);
    };

    return (
        <AvatarContext.Provider value={{ avatarData, updateAvatar }}>
            {children}
        </AvatarContext.Provider>
    );
};
