import "./Teams.css";

function Teams() {
  return (
    <div className="teams-page">
      <div className="header">
        <h1 className="title">Gestión del Equipo</h1>
        <button className="main-btn">Crear / Editar Equipo</button>
      </div>

      <div className="teams-container">
        {/* EQUIPO 1 */}
        <div className="team-card">
          <h2>Red Speed</h2>

          <div className="section">
            <h3>Presupuesto</h3>
            <p className="money">$1,200,000</p>
          </div>

          <div className="section">
            <h3>Conductores</h3>
            <ul>
              <li>Lewis Hamilton</li>
              <li>George Russell</li>
            </ul>
          </div>

          <div className="section">
            <h3>Patrocinadores</h3>
            <ul>
              <li>Red Bull</li>
              <li>Pirelli</li>
              <li>Mobil 1</li>
            </ul>
          </div>

          <div className="buttons-row">
            <button className="secondary-btn">Inventario</button>
          </div>

          <div className="buttons-row">
            <button className="car-btn">Coche 1</button>
            <button className="car-btn">Coche 2</button>
          </div>
        </div>

        {/* EQUIPO 2 */}
        <div className="team-card">
          <h2>Blue Racing</h2>

          <div className="section">
            <h3>Presupuesto</h3>
            <p className="money">$950,000</p>
          </div>

          <div className="section">
            <h3>Conductores</h3>
            <ul>
              <li>Max Verstappen</li>
              <li>Sergio Pérez</li>
            </ul>
          </div>

          <div className="section">
            <h3>Patrocinadores</h3>
            <ul>
              <li>Oracle</li>
              <li>Castrol</li>
            </ul>
          </div>

          <div className="buttons-row">
            <button className="secondary-btn">Inventario</button>
          </div>

          <div className="buttons-row">
            <button className="car-btn">Coche 1</button>
            <button className="car-btn">Coche 2</button>
          </div>
        </div>

        {/* EQUIPO 3 */}
        <div className="team-card">
          <h2>Quantum Drive</h2>

          <div className="section">
            <h3>Presupuesto</h3>
            <p className="money">$550,000</p>
          </div>

          <div className="section">
            <h3>Conductores</h3>
            <ul>
              <li>Charles Leclerc</li>
              <li>	George Russell</li>
            </ul>
          </div>

          <div className="section">
            <h3>Patrocinadores</h3>
            <ul>
              <li>Oracle</li>
              <li>Castrol</li>
            </ul>
          </div>

          <div className="buttons-row">
            <button className="secondary-btn">Inventario</button>
          </div>

          <div className="buttons-row">
            <button className="car-btn">Coche 1</button>
            <button className="car-btn">Coche 2</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Teams;
