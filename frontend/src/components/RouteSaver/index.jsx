import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteSaver = () => {
  const location = useLocation();

  useEffect(() => {
    // Сохраняем текущий маршрут в localStorage
    localStorage.setItem("lastVisitedRoute", location.pathname);
  }, [location]);

  return null; // Этот компонент не рендерит ничего
};

export default RouteSaver;