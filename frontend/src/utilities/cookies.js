// Установка куки
export const setCookie = (key, value, days = 7) => {
    localStorage.setItem(key, value)
};

// Получение куки
export const getCookie = (key) => {
    return localStorage.getItem(key) || null;
};

// используется для проверки, залогинен ли пользователь
export const isCookieExists = (key) => {
    return getCookie(key) !== null
}

// Удаление куки
export const deleteCookie = (key) => {
    localStorage.removeItem(key)
};

