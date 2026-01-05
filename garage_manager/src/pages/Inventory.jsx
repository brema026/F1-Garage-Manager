import "./Inventory.css";

function Inventory() {
  return (
    <div className="inventory-page">
      <h1 className="title">Inventario del Equipo</h1>

      <div className="inventory-layout">
        {/* PANEL IZQUIERDO */}
        <div className="team-selector">
        <h2>Seleccionar Equipo</h2>

        <select>
            <option>Racing Team</option>
            <option>Speed Force</option>
            <option>Red Bull</option>
        </select>
        </div>

        {/* INVENTARIO */}
        <div className="inventory-content">
          <h2>Inventario Actual del Equipo</h2>

          <div className="inventory-table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Parte</th>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Fecha de Adquisición</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Motor Mejorado</td>
                  <td>Motor</td>
                  <td className="qty">2</td>
                  <td>24/04/2024</td>
                </tr>
                <tr>
                  <td>Turbo Avanzado</td>
                  <td>Motor</td>
                  <td className="qty">5</td>
                  <td>23/04/2024</td>
                </tr>

                <tr>
                  <td>Alerón Frontal Pro</td>
                  <td>Aerodinámica</td>
                  <td className="qty">3</td>
                  <td>24/04/2024</td>
                </tr>
                <tr>
                  <td>Alerón Trasero Lite</td>
                  <td>Aerodinámica</td>
                  <td className="qty">2</td>
                  <td>24/04/2024</td>
                </tr>

                <tr>
                  <td>Suspensión Fórmula</td>
                  <td>Suspensión</td>
                  <td className="qty">1</td>
                  <td>24/04/2024</td>
                </tr>
                <tr>
                  <td>Amortiguador Avanzado</td>
                  <td>Suspensión</td>
                  <td className="qty">4</td>
                  <td>24/04/2024</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
