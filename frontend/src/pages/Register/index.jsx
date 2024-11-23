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

  // Обработка отправки формы
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (password1 !== password2) {
        return setError('Пароли не совпадают!');
      }

      setError('');
  
      const data = await createUser();
      navigate("/login");
    } catch (error) {
      setError(error)
    }
  };

  // Создание нового юзера
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
    <div class="main">
        <h1 className="register-title">Kaban</h1>
        <h3>Account registration</h3>
        <form onSubmit={handleSubmit}>
            <label htmlFor="fullname" className="register-label">
                Full Name:
            </label>
            <input type="text" 
                   id="fullname" 
                   name="fullname" 
                   placeholder="Enter your Full Name" 
                   required 
                   className="register-input"
                   onChange={(event) => setFullname(event.target.value)}>
            </input>
            <label htmlFor="username" className="register-label">
                Username:
            </label>
            <input type="text" 
                   id="username" 
                   name="username" 
                   placeholder="Enter your Name" 
                   required 
                   className="register-input"
                   onChange={(event) => setUsername(event.target.value)}>
            </input>
            <label htmlFor="password" className="register-label">
                Password:
            </label>
            <input type="password" 
                   id="password" 
                   name="password" 
                   placeholder="Enter your Password" 
                   required 
                   className="register-input"
                   onChange={(event) => setPassword1(event.target.value)}>
            </input>
            <label htmlFor="password2" className="register-label">
                Repeat Password:
            </label>
            <input type="password" 
                   id="password2" 
                   name="password2" 
                   placeholder="Repeat your Password" 
                   required 
                   className="register-input"
                   onChange={(event) => setPassword2(event.target.value)}>
            </input>
            <div class="wrap">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" className="register-button">Register</button>
            </div>
        </form>
        <p>You have an account?
            <Link to="/login" class="register-href"> Log in</Link>
        </p>
    </div>
  );
}

export default Register;
