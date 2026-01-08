import React, { useState } from "react";
import "./CarSetup.css";
import carImage from "../assets/f1-car.png";

function CarSetup() {
  const [engine, setEngine] = useState("Motor Mejorado");
  const [aero, setAero] = useState("Alerón Frontal Pro");
  const [tires, setTires] = useState("Neumáticos Duros");
  const [driver, setDriver] = useState("");

  const P = 7;
  const A = 8;
  const M = 3;

  return (
    <div className="car-setup-page">
      <h1 className="title">Armado de Carro F1</h1>

      <div className="car-setup-container">
        {/* PANEL IZQUIERDO */}
        <div className="setup-panel">
          <h2>Categorías <span>Partes sin accesorios</span></h2>

          {/* UNIDAD DE POTENCIA */}
          <div className="part-card">
            <div>
              <h3>Unidad de Potencia</h3>
              <p>{engine}</p>

              <div className="stats">
                <span className="stat p">P +7</span>
                <span className="stat a">A +3</span>
                <span className="stat m">M +2</span>
              </div>
            </div>

            <select
              className="side-select"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
            >
              <option>Motor Estándar</option>
              <option>Motor Mejorado</option>
              <option>Motor Élite</option>
            </select>
          </div>

          {/* AERODINÁMICA */}
          <div className="part-card">
            <div>
              <h3>Paquete Aerodinámico</h3>
              <p>{aero}</p>

              <div className="stats">
                <span className="stat p">P +0</span>
                <span className="stat a">A +5</span>
                <span className="stat m">M +1</span>
              </div>
            </div>

            <select
              className="side-select"
              value={aero}
              onChange={(e) => setAero(e.target.value)}
            >
              <option>Alerón Básico</option>
              <option>Alerón Frontal Pro</option>
              <option>Alerón Competición</option>
            </select>
          </div>


          {/* PARTES SIMPLES */}
          <div className="simple-part">
            <span>Neumáticos</span>
            <select value={tires} onChange={e => setTires(e.target.value)}>
             <option>Ninguno</option>
            </select>
          </div>

          <div className="simple-part">
            <span>Suspensión</span>
            <select>
              <option>Ninguno</option>
            </select>
          </div>

          <div className="simple-part">
            <span>Caja de Cambios</span>
            <select>
              <option>Ninguno</option>
            </select>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="summary-panel">
          <h2>Resumen</h2>

          <div className="car-preview">
            <img src={carImage} alt="Carro F1" className="car-image" />
          </div>

          <div className="car-buttons">
            <button className="car-btn active">Carro 1</button>
            <button className="car-btn">Carro 2</button>
          </div>


          {/* CONDUCTOR */}
          <div className="driver-select">
            <span>{driver || "Ningún Conductor"}</span>
            <select value={driver} onChange={e => setDriver(e.target.value)}>
              <option value="">-- Seleccionar --</option>
              <option>Leo Martínez</option>
              <option>Alex Fernández</option>
              <option>Marco Rossi</option>
            </select>
          </div>

          {/* STATS */}
          <div className="final-stats">
            <span className="stat p">P: {P}</span>
            <span className="stat a">A: {A}</span>
            <span className="stat m">M: {M}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarSetup;
