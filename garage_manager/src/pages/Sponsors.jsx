import "./Sponsors.css";

function Sponsors() {
  return (
    <div className="sponsors-page">
      <h1 className="title">Gestión de Patrocinadores</h1>

      <button className="main-btn">Registrar Patrocinador</button>

      <div className="sponsors-container">
        {/* LISTA DE PATROCINADORES */}
        <div className="sponsors-list">
          <h2>Patrocinadores Registrados</h2>

          <div className="sponsor-item active">
            <p className="sponsor-name">Red Bull</p>
            <p className="sponsor-h"></p>
          </div>

          <div className="sponsor-item">
            <p className="sponsor-name">Pirelli</p>
            <p className="sponsor-h"></p>
          </div>

          <div className="sponsor-item">
            <p className="sponsor-name">Mobil 1</p>
            <p className="sponsor-h"></p>
          </div>

          <div className="sponsor-item">
            <p className="sponsor-name">Shell</p>
            <p className="sponsor-h"></p>
          </div>
        </div>

        {/* DETALLE DEL PATROCINADOR */}
        <div className="sponsor-detail">
          <h2>Detalle de Aportes Registrados</h2>

          <div className="detail-box">
            <div className="detail-header">
              <h3>Racing Team</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>23/04/2024</td>
                  <td className="money">$500,000</td>
                  <td>Pago por publicidad</td>
                </tr>
                <tr>
                  <td>12/04/2024</td>
                  <td className="money">$250,000</td>
                  <td>Pago por publicidad</td>
                </tr>
                <tr>
                  <td>28/03/2024</td>
                  <td className="money">$350,000</td>
                  <td>Bono por victoria</td>
                </tr>
                <tr>
                  <td>08/03/2024</td>
                  <td className="money">$150,000</td>
                  <td>Pago por patrocinio</td>
                </tr>
              </tbody>
            </table>

            <p className="total-aportes">Total: $1,250,000</p>
          </div>

          <div className="actions">
            <button className="secondary-btn">Eliminar</button>
            <button className="danger-btn">Registrar Aporte</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sponsors;
