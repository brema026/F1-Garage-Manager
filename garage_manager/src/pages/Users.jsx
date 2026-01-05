import { useState } from "react";
import "./Users.css";

function Users() {
  const [mode, setMode] = useState("login");

  return (
    <div className="users-page">
        <h1 className="title">Gestión de Usuarios</h1>

      <div className="users-container">
        <div className="user-card">
          <h2>{mode === "login" ? "Iniciar Sesión" : "Registro"}</h2>

          <div className="toggle-row">
            <button
              className={`secondary-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`secondary-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Registro
            </button>
          </div>

          {mode === "login" ? (
            <form className="user-form">
              <label>Usuario</label>
              <input type="text" placeholder="Usuario" />

              <label>Contraseña</label>
              <input type="password" placeholder="Contraseña" />

              <button className="main-btn">Ingresar</button>
            </form>
          ) : (
            <form className="user-form">
              <label>Usuario</label>
              <input type="text" placeholder="Usuario" />

              <label>Correo</label>
              <input type="email" placeholder="Correo" />

              <label>Contraseña</label>
              <input type="password" placeholder="Contraseña" />

              <label>Rol</label>
              <select>
                <option>Admin</option>
                <option>Engineer</option>
                <option>Driver</option>
              </select>

              <button className="main-btn">Registrar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;
