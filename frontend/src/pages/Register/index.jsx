import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "../../utilities/api";
import './register.css'; // Импортируем стили

function Register(props) {
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Обработка отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (password1 !== password2) {
        return setError('Пароли не совпадают!');
      }

      setError('');
  
      const data = await User.create(fullname, username, password1);
      navigate("/login");
    } catch (error) {
      setError(error)
    }
  };

  return (
    <>
      <div className="body-wrapper">
        <div className="main">
          <h1 className="register-title">Kaban</h1>
          <h3>Регистрация</h3>
          <form onSubmit={handleSubmit}>
              <label htmlFor="fullname" className="register-label">
                  ФИО:
              </label>
              <input type="text" 
                    id="fullname" 
                    name="fullname" 
                    placeholder="Введите Ваше ФИО" 
                    required 
                    className="register-input"
                    onChange={(event) => setFullname(event.target.value)}>
              </input>
              <label htmlFor="username" className="register-label">
                  Логин:
              </label>
              <input type="text" 
                    id="username" 
                    name="username" 
                    placeholder="Введите Ваш логин" 
                    required 
                    className="register-input"
                    onChange={(event) => setUsername(event.target.value)}>
              </input>
              <label htmlFor="password" className="register-label">
                  Пароль:
              </label>
              <input type="password" 
                    id="password" 
                    name="password" 
                    placeholder="Введите пароль" 
                    required 
                    className="register-input"
                    onChange={(event) => setPassword1(event.target.value)}>
              </input>
              <label htmlFor="password2" className="register-label">
                  Повторите пароль:
              </label>
              <input type="password" 
                    id="password2" 
                    name="password2" 
                    placeholder="Повторите введённый пароль" 
                    required 
                    className="register-input"
                    onChange={(event) => setPassword2(event.target.value)}>
              </input>
              <div class="wrap">
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  <button type="submit" className="register-button">Зарегистрироваться</button>
              </div>
          </form>
          <p>Уже есть аккаунт?
              <Link to="/login" class="register-href"> Войти</Link>
          </p>
        </div>
      </div>
    </> 
  );
}

export default Register;
