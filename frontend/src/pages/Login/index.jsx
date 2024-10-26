import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css'; // Импортируем стили


const Login = (props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser();
      const access_token = data["access_token"];
      props.setToken(access_token);
      localStorage.setItem("token", access_token);
      navigate("/board");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginUser = async () => {
    const searchParams = new URLSearchParams();
    searchParams.append("username", email);
    searchParams.append("password", password);

    const response = await fetch("http://localhost:8000/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: searchParams.toString(),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };

  return (
    <div className="login-container font-inter">
      <div className="login-form">
        <h2 className="login-title">Вход</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Логин</label>
            <input
              id="username"
              name="username"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="login-footer">
            <div className="register-link">
              Еще нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
            </div>
            <button type="submit" className="login-button">Войти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
