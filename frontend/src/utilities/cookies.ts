// Установка куки
export const setCookie = (key: string, value: string): void => {
    localStorage.setItem(key, value)
};

// Получение куки
export const getCookie = (key: string): string | null => {
    return localStorage.getItem(key) || null;
};

// используется для проверки, залогинен ли пользователь
export const isCookieExists = (key: string): boolean => {
    return getCookie(key) !== null
}

// Удаление куки
export const deleteCookie = (key: string): void => {
    localStorage.removeItem(key)
};

