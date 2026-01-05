import "./Drivers.css";

function Drivers() {
  return (
    <div className="drivers-page">
      <h1 className="title">Gestión de Conductores</h1>

      <button className="main-btn">Registrar Conductor</button>

      <div className="drivers-container">
        {/* LISTA DE CONDUCTORES */}
        <div className="drivers-list">
          <h2>Conductores Registrados</h2>

          <div className="driver-item active">
            <p className="driver-name">Alejandro Gómez</p>
            <p className="driver-h">H: 89</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">Daniel Pérez</p>
            <p className="driver-h">H: 78</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">	George Russell</p>
            <p className="driver-h">H: 75</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">Max Verstappen</p>
            <p className="driver-h">H: 95</p>
          </div>
          
          <div className="driver-item">
            <p className="driver-name">Sergio Pérez</p>
            <p className="driver-h">H: 80</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">	Charles Leclerc</p>
            <p className="driver-h">H: 86</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">	Lando Norris</p>
            <p className="driver-h">H: 88</p>
          </div>

          <div className="driver-item">
            <p className="driver-name">	Pierre Gasly</p>
            <p className="driver-h">H: 87</p>
          </div>


        </div>

        {/* DETALLE DEL CONDUCTOR */}
        <div className="driver-detail">
          <h2>Detalle del Conductor</h2>

          <div className="detail-box">
            <h3>Alejandro Gómez</h3>
            <p><strong>Equipo:</strong> Racing Team</p>
            <p><strong>Habilidad (H):</strong> 89</p>
          </div>

          <div className="detail-box">
            <h3>Historial de Resultados</h3>

            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Circuito</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#1</td>
                  <td>Monza</td>
                  <td>25</td>
                </tr>
                <tr>
                  <td>#3</td>
                  <td>Spa</td>
                  <td>15</td>
                </tr>
                <tr>
                  <td>#2</td>
                  <td>Silverstone</td>
                  <td>18</td>
                </tr>
              </tbody>
            </table>

            <p className="total-points">Puntos Totales: 91</p>
          </div>

          <div className="actions">
            <button className="secondary-btn">Editar</button>
            <button className="danger-btn">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Drivers;
