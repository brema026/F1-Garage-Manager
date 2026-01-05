function Inventory() {
  return (
    <div>
      <h2>Inventario del Equipo</h2>
      <table>
        <thead>
          <tr>
            <th>Parte</th>
            <th>Categoría</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>PU V8</td>
            <td>Power Unit</td>
            <td>1</td>
          </tr>
          <tr>
            <td>Soft Tire</td>
            <td>Neumáticos</td>
            <td>2</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Inventory;
