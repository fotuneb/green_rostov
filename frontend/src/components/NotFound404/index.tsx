import "./not_found.css";

// Заглушка для ошибки 404
const NotFound404 = () => {
  return (
    <>
      <main className="404-container">
          <p className="not-found-title">404</p>
          <p className="not-found-subtitle">произошли технические шоколадки</p>
          <div className="circle-1"></div>
          <div className="circle-2"></div>
          <div className="circle-3"></div>
          <div className="circle-4"></div>
      </main>
    </>
  );
}

export default NotFound404