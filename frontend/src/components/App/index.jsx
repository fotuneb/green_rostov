import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCookie } from "../../utilities/cookies.js";
import NotFound404 from "../NotFound404";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import BoardPage from "../../pages/Board";
import Admin from "../../pages/Admin";
import Navbar from "../Navbar";

// Получить токен пользователя
function getToken() {
  return getCookie("token");
}

// Получить user_id
function getUserID() {
  return getCookie("user_id");
}

// Основной компонент приложения
function App() {
  const [token, setToken] = useState(() => getToken());
  const [isLogged, setIsLogged] = useState(() => !!getToken() && !!getUserID());

  // Эффект для обновления isLogged при изменении token
  useEffect(() => {
    setIsLogged(!!token && !!getUserID());
  }, [token]);

  // Обертка для защищенных маршрутов
  const ProtectedRoute = ({ isLogged, children, redirectTo }) => {
    return isLogged ? children : <Navigate to={redirectTo} replace />;
  };

  // Обертка для маршрутов неавторизованных пользователей
  const PublicRoute = ({ isLogged, children, redirectTo }) => {
    return !isLogged ? children : <Navigate to={redirectTo} replace />;
  };

  // Настройки маршрутизации
  return (
    <div className="App">
     <BrowserRouter>
      <Routes>
        {/* Маршрут для логина (доступ только для неавторизованных пользователей) */}
        <Route
          path="/login"
          element={
            <PublicRoute isLogged={isLogged} redirectTo="/board">
              <Login setIsLogged={setIsLogged} />
            </PublicRoute>
          }
        />

        {/* Маршрут для регистрации */}
        <Route
          path="/signup"
          element={
            <PublicRoute isLogged={isLogged} redirectTo="/board">
              <Register setIsLogged={setIsLogged} />
            </PublicRoute>
          }
        />

        {/* Маршрут для главной доски (доступ только для авторизованных пользователей) */}
        <Route
          path="/board"
          element={
            <ProtectedRoute isLogged={isLogged} redirectTo="/login">
              <>
                <Navbar setIsLogged={setIsLogged} />
                <BoardPage />
              </>
            </ProtectedRoute>
          }
        />

        {/* Маршрут для админки */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isLogged={isLogged} redirectTo="/login">
              <>
                <Navbar setIsLogged={setIsLogged} />
                <Admin />
              </>
            </ProtectedRoute>
          }
        />

         {/* Главный маршрут */}
        <Route
          path="/"
          element={
            isLogged ? <Navigate to="/board" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Страница 404 */}
        <Route path="/404" element={<NotFound404 />} />

        {/* Обработка неизвестных маршрутов */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
 