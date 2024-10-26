import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './register.css'; // Импортируем стили

function Register(props) {
  const [email, setEmail] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await createUser();
      const access_token = data["access_token"];
      props.setToken(access_token);
      localStorage.setItem("token", access_token);
      navigate("/board");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const createUser = async () => {
    const formData = {
      email: email,
      password1: password1,
      password2: password2,
    };

    const response = await fetch("http://localhost:8000/api/users", {
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
            <label htmlFor="email-address">Адрес эл. почты</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password1">Пароль</label>
            <input
              id="password1"
              name="password1"
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
            <button type="submit" className="register-button">Зарегистрироваться</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
