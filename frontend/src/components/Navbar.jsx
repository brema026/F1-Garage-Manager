import React from "react";
import "./Navbar.css";

function Navbar({ setView }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        F1 <span>Garage</span>
      </div>

      <div className="navbar-buttons">
        <button onClick={() => setView("teams")}>Equipos</button>
        <button onClick={() => setView("drivers")}>Conductores</button>
        <button onClick={() => setView("sponsors")}>Patrocinadores</button>
        <button onClick={() => setView("parts")}>Partes</button>
        <button onClick={() => setView("inventory")}>Inventario</button>
        <button onClick={() => setView("setup")}>Armado</button>
      </div>
    </nav>
  );
}

export default Navbar;
