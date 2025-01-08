// Форматирование даты публикации коммента
export const formatPublishDate = (datePosted: string): string => {
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

// Метод для форматирования даты (для дедлайна)
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString); // Преобразуем строку в объект Date

    // Получаем компоненты даты
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    // Формируем дату в нужном формате
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}