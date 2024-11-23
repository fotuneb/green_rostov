import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Router } from "react-router-dom";
import { getCookie } from "../../utilities/cookies.js";
import Navbar from "../Navbar"
import NotFound404 from "../NotFound404";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Board from "../../pages/Board";
import Admin from "../../pages/Admin";

function getToken() {
  return getCookie("token");
}

// Основной компонент приложения
function App() {
  const [token, setToken] = useState(() => getToken());

  // Проверка, залогинен ли пользователь
  const verifyLogin = () => {
      return getCookie("token") && getCookie("user_id")
  }
  
  // Устанавливаем флаг
  const isLogged = verifyLogin()

  // Если флаг true, при запуске отправляем юзера на доску
  // Если флаг false, пользователь должен пройти авторизацию
  return (
    <div className="App">
      <BrowserRouter>
        {isLogged ? (
          <>
            <Navbar token={token} setToken={setToken} />
            <Board token={token} />
          </>
        ) : (
          <Routes>
            {/* Базовый маршрут для логина */}
            <Route path="/" element={<Login setToken={setToken} />} />

            {/* Маршрут для /board */}
            <Route
              path="/board"
              element={
                <>
                  <Navbar token={token} setToken={setToken} />
                  <Board token={token} />
                </>
              }
            />

            {/* Маршрут для /signup */}
            <Route
              path="/signup"
              element={<Register setToken={setToken} />}
            />

            {/* Маршрут /login для логина со страницы регистрации */}
            <Route
              path="/login"
              element={<Login setToken={setToken} />}
            />

            {/* Маршрут /admin для открытия страницы админки */}
            <Route
              path="/admin"
              element={<Admin token={token} />}
            />

            {/* Маршрут для страницы 404 */}
            <Route path="*" element={<NotFound404 />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
 