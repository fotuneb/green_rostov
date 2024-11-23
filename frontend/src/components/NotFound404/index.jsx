import React from 'react'

// Заглушка для ошибки 404
const NotFound404 = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>404</h1>
      <p>Страница не найдена</p>
      <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
        Вернуться на главную
      </a>
    </div>
  );
}

export default NotFound404