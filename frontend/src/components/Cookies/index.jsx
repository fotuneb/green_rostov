// Установка куки
export const setCookie = (key, value, days = 7) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Strict; Secure`;
};

// Получение куки
export const getCookie = (key) => {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [cookieKey, cookieValue] = cookie.split("=");
        if (cookieKey === key) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
};

// Удаление куки
export const deleteCookie = (key) => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
