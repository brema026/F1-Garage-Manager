import "./Parts.css";

function Parts() {
  return (
    <div className="parts-page">
      <h1 className="title">Tienda de Partes</h1>

      {/* BARRA SUPERIOR */}
      <div className="parts-toolbar">
        <button className="main-btn">Registrar Parte</button>

        <select className="filter">
          <option>Todas</option>
          <option>Motor</option>
          <option>Aerodinámica</option>
          <option>Suspensión</option>
        </select>

        <input
          type="text"
          placeholder="Buscar Parte..."
          className="search-input"
        />

        <button className="main-btn">Buscar</button>
      </div>

      {/* TABLA */}
      <div className="parts-table-container">
        <table className="parts-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Parte</th>
              <th>Rendimiento</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Comprar</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Motor</td>
              <td>Motor Mejorado</td>
              <td>
                <span className="badge p">P +7</span>
                <span className="badge a">A +3</span>
                <span className="badge m">M +2</span>
              </td>
              <td className="money">$300,000</td>
              <td>20</td>
              <td><button className="buy-btn">Comprar</button></td>
            </tr>

            <tr>
              <td>Motor</td>
              <td>Turbo Avanzado</td>
              <td>
                <span className="badge p">P +5</span>
                <span className="badge a">A +4</span>
                <span className="badge m">M +2</span>
              </td>
              <td className="money">$150,000</td>
              <td>15</td>
              <td><button className="buy-btn">Comprar</button></td>
            </tr>

            <tr>
              <td>Aerodinámica</td>
              <td>Alerón Frontal Pro</td>
              <td>
                <span className="badge a">A +5</span>
                <span className="badge m">M +1</span>
              </td>
              <td className="money">$200,000</td>
              <td>10</td>
              <td><button className="buy-btn">Comprar</button></td>
            </tr>

            <tr>
              <td>Suspensión</td>
              <td>Suspensión Fórmula</td>
              <td>
                <span className="badge m">M +5</span>
                <span className="badge a">A +1</span>
              </td>
              <td className="money">$250,000</td>
              <td>12</td>
              <td><button className="buy-btn">Comprar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Parts;
