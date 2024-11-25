import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { getCookie } from "../../utilities/cookies.js";
import RouteSaver from "../RouteSaver";
import RedirectToLastRoute from "../RedirectToLastRoute";
import NotFound404 from "../NotFound404";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import BoardPage from "../../pages/Board";
import Admin from "../../pages/Admin";
import Navbar from "../Navbar";
import LayoutWithNavbar from "../../layouts/LayoutWithNavbar.jsx";

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
          <Routes>
            {/* Базовый маршрут для /board */}
            <Route path="/board" element={
              <>
                <Navbar token={token} setToken={setToken} />
                <BoardPage token={token} />
              </>
            }/>

            {/* Маршрут для /admin */}
            <Route path="/admin" element={
              <>
                <Navbar token={token} setToken={setToken} />
                <Admin token={token} />
              </>
            }/>

            {/* Маршрут для страницы 404 */}
            <Route 
              path="/404" 
              element={
                <NotFound404 />
              }/>

            {/* Перенаправление на /404, если маршрут не найден */}
            <Route path="*" element={
              <Navigate to="/404" replace />
            }/>
          </Routes>
        </>
      ) : (
        <>
          <Routes>
            {/* Сохранение и восстановление маршрута */}
            <Route path="*" element={
              <>
                <RouteSaver />
                <RedirectToLastRoute />
              </>
            }/>

            {/* Базовый маршрут для логина */}
            <Route path="/" element={
              <Login setToken={setToken} />
            }/>

             {/* Маршруты для /board и /admin и layour для общего компонента Navbar */}
            <Route element={<LayoutWithNavbar token={token} setToken={setToken} />}>
              <Route path="/board" element={<BoardPage token={token} />} />
              <Route path="/admin" element={<Admin token={token} />} />
            </Route>

            {/* Маршрут для логина */}
            <Route
              path="/login"
              element={
                <Login setToken={setToken} />
              }/>

            {/* Базовый маршрут для логина */}
            <Route path="/signup" element={
              <Register setToken={setToken} />
            }/>
          </Routes>
        </>
      )}
    </BrowserRouter>
    </div>
  );
}

export default App;
 