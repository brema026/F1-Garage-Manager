function CarSetup() {
  const P = 25;
  const A = 18;
  const M = 20;

  return (
    <div>
      <h2>Armado del Carro</h2>

      <div className="setup">
        <p>Power Unit: PU V8</p>
        <p>Aerodinámica: Aero Pro</p>
        <p>Neumáticos: Soft</p>
        <p>Suspensión: Sport</p>
        <p>Caja de Cambios: 7-Speed</p>
      </div>

      <h3>Resumen</h3>
      <ul>
        <li>Potencia (P): {P}</li>
        <li>Aerodinámica (A): {A}</li>
        <li>Manejo (M): {M}</li>
      </ul>
    </div>
  );
}

export default CarSetup;
