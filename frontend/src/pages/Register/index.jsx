import React, { useState } from "react";
import { setCookie } from "../../utilities/cookies.js"
import { Link, useNavigate } from "react-router-dom";
import './register.css'; // Импортируем стили

function Register(props) {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (password1 !== password2) {
        return setError('Пароли не совпадают!');
      }

      setError('');

      const data = await createUser();
      // Получаем необходимые данные
      const access_token = data["access_token"];
      const user_id = data["id"];
      const role = data["role"];
      // Задаем токен
      props.setToken(access_token);
      // Сохранение данных в куки
      setCookie("token", access_token, 7);
      setCookie("user_id", user_id, 7);
      setCookie("role", role, 7);
      // Переходим в доску
      navigate("/board");
    } catch (error) {
      setError(error)
    }
  };

  const createUser = async () => {
    const formData = {
      fullname: fullname,
      login: username,
      password1: password1,
    };

    const response = await fetch(process.env.REACT_APP_PUBLIC_URL + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    return await response.json();
  };

  return (
    <div className="register-container font-inter">
      <div className="register-form">
        <h2 className="register-title">Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullname">ФИО</label>
            <input
              id="fullname"
              name="fullname"
              required
              onChange={(event) => setFullname(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Логин</label>
            <input
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={(event) => setPassword1(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password2">Подтверждение пароля</label>
            <input
              id="password2"
              name="password2"
              type="password"
              required
              onChange={(event) => setPassword2(event.target.value)}
            />
          </div>
          <div className="register-footer">
            <div className="login-link">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" className="register-button">Зарегистрироваться</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
