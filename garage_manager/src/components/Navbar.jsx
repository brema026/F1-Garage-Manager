import React from "react";

function Navbar({ setView }) {
  return (
    <div style={{ backgroundColor: "#222", padding: "10px" }}>
      <button onClick={() => setView("users")}>Usuarios</button>
      <button onClick={() => setView("teams")}>Equipos</button>
      <button onClick={() => setView("drivers")}>Conductores</button>
      <button onClick={() => setView("sponsors")}>Patrocinadores</button>
      <button onClick={() => setView("parts")}>Partes</button>
      <button onClick={() => setView("inventory")}>Inventario</button>
      <button onClick={() => setView("setup")}>Armado</button>
    </div>
  );
}

export default Navbar;
