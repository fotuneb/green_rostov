import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteSaver = () => {
  const location = useLocation();

  useEffect(() => {
    // Список маршрутов для исключения из записи
    const exclude = ["/404"]

    // Не сохраняем, если содержит маршрут из списка исключенных
    if (exclude.includes(location.pathname)) return;

    // Доступные маршруты записываем в localStorage
    localStorage.setItem("lastVisitedRoute", location.pathname);
  }, [location]);

  return null; // Этот компонент не рендерит ничего
};

export default RouteSaver;