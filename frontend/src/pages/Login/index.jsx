import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from "../../utilities/api";
import { setCookie } from "../../utilities/cookies.js";
import './login.css'; // Импортируем стили


const Login = (props) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await User.login(email, password);
      // Получаем необходимые данные
      const access_token = data["access_token"];
      const user_id = data["id"];
      const role = data["role"];
      // Задаем токен
      props.setToken(access_token);
      // Сохранение данных в куки
      setCookie("token", access_token);
      setCookie("user_id", user_id);
      setCookie("role", role);
      // Переходим в доску
      navigate("/board");
    } catch (error) {
      setError(error + '');
    }
  };

  return (
    <>
      <div className="body-wrapper">
        <div className="main">
            <h1 className="login-title">Kaban</h1>
            <h3>Вход в аккаунт</h3>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username" className="login-label">
                    Логин:
                </label>
                <input 
                      className="login-input"
                      type="text" 
                      id="username" 
                      name="username" 
                      required
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Введите логин">
                </input>
                <label htmlFor="password" className="login-label">
                    Пароль:
                </label>
                <input className="login-input"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  required
                  onChange={(event) => setPassword(event.target.value)}>
                </input>
                <div className="wrap">
                  <button type="submit" className="login-button">Log in</button>
                </div>
            </form>
            <p>{error && <p style={{ color: 'red' }}>{error}</p>}
                Ещё нет аккаунта?
                <Link to="/signup" className="login-href"> Зарегистрироваться</Link>
            </p>
        </div>
      </div> 
    </>
  );
};

export default Login;
