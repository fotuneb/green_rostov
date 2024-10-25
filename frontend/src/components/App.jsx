import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Board from "./Board";
import Navbar from "./Navbar";
import Register from "./Register";
import Login from "./Login";
import Index from "./Index";

function getToken() {
  return localStorage.getItem("token");
}

function App() {
  const [token, setToken] = useState(() => getToken());

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar token={token} setToken={setToken} />
        <Routes>
          <Route exact path="/" element={<Index />} />
          <Route exact path="/board" element={<Board token={token} />} />
          <Route
            exact
            path="/signup"
            element={<Register setToken={setToken} />}
          />
          <Route exact path="/login" element={<Login setToken={setToken} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
