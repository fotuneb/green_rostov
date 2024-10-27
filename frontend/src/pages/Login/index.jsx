import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css'; // Импортируем стили


const Login = (props) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser();
      const access_token = data["access_token"];
      props.setToken(access_token);
      localStorage.setItem("token", access_token);
      localStorage.setItem("user_id", data.id)
      localStorage.setItem("role", data.role);
      navigate("/board");
    } catch (error) {
      setError(error + '');

    }
  };

  const loginUser = async () => {
    const searchParams = new URLSearchParams();
    searchParams.append("username", email);
    searchParams.append("password", password);

    const response = await fetch(process.env.REACT_APP_PUBLIC_URL + "/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: searchParams.toString(),
    });

    if (response.status == 401) {
      throw new Error('Неправильный логин или пароль!')
    }

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
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button type="submit" className="login-button">Войти</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
