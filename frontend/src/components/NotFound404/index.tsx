import React from 'react'
import "./not_found.css";


// Заглушка для ошибки 404
const NotFound404 = () => {
  return (
    <>
      <main class="404-container">
          <p class="not-found-title">404</p>
          <p class="not-found-subtitle">произошли технические шоколадки</p>
          <div class="circle-1"></div>
          <div class="circle-2"></div>
          <div class="circle-3"></div>
          <div class="circle-4"></div>
      </main>
    </>
  );
}

export default NotFound404