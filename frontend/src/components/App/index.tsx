import { useState, useEffect } from "react";
import type { FC } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCookie } from "@utils/cookies";
import { AvatarProvider } from "@contexts/AvatarContext";
import NotFound404 from "@components/NotFound404";
import Navbar from "@components/Navbar";
import Login from "@pages/Login";
import Register from "@pages/Register";
import BoardPage from "@pages/Board";
import Admin from "@pages/Admin";

// Получить токен пользователя
function getToken(): string | null {
  return getCookie("token");
}

// Получить user_id
function getUserID(): string | null {
  return getCookie("user_id");
}

// Основной компонент приложения
const App: FC = () => {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLogged, setIsLogged] = useState<boolean>(() => !!getToken() && !!getUserID());

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
    <AvatarProvider>
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
    </AvatarProvider>
  );
}

export default App;
 