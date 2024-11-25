import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToLastRoute = () => {

  // Список доступных маршрутов приложения
  const availableRoutes = ["/board", "/admin", "/login", "/signup", "/api"]
  const navigate = useNavigate();
  
  // Если последний маршрут существует, то перенаправляем на него
  // Если последний маршрут не существует, то отправляем на 404
  useEffect(() => {
    const lastRoute = localStorage.getItem("lastVisitedRoute");
    if (availableRoutes.includes(lastRoute)) {
      navigate(lastRoute);
    } else {
      navigate("/404");
    }
  }, [navigate]);

  return null; // Этот компонент не рендерит ничего
};

export default RedirectToLastRoute;