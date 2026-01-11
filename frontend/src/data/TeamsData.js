export const TEAMS = [
  {
    id_equipo: 1,
    nombre: 'Red Racing Team',
    presupuesto_total: 2500000,
    conductores: [
      { id_conductor: 1, nombre: 'Lewis Hamilton', habilidad_h: 95 },
      { id_conductor: 2, nombre: 'George Russell', habilidad_h: 90 },
      { id_conductor: 3, nombre: 'Max Verstappen', habilidad_h: 98 },
      { id_conductor: 4, nombre: 'Carlos Sainz', habilidad_h: 91 },
      { id_conductor: 5, nombre: 'Charles Leclerc', habilidad_h: 92 },
    ],
    aportes: [
      { id_aporte: 1, nombre_patrocinador: 'Red Bull Racing', monto: 800000, fecha: '2025-12-01', descripcion: 'Patrocinio principal' },
      { id_aporte: 2, nombre_patrocinador: 'Pirelli', monto: 500000, fecha: '2025-12-02', descripcion: 'Neumáticos' },
      { id_aporte: 3, nombre_patrocinador: 'Mobil 1', monto: 400000, fecha: '2025-12-03', descripcion: 'Lubricantes' },
      { id_aporte: 4, nombre_patrocinador: 'Oracle', monto: 350000, fecha: '2025-12-05', descripcion: 'Tecnología' },
      { id_aporte: 5, nombre_patrocinador: 'Infiniti', monto: 300000, fecha: '2025-12-06', descripcion: 'Componentes' },
      { id_aporte: 6, nombre_patrocinador: 'Google', monto: 150000, fecha: '2025-12-07', descripcion: 'Software' },
    ],
    carros: [
      { id_carro: 1, nombre: 'RRT-01', finalizado: true, stats: { p: 35, a: 32, m: 30 } },
      { id_carro: 2, nombre: 'RRT-02', finalizado: true, stats: { p: 33, a: 30, m: 28 } },
    ],
  },
  {
    id_equipo: 2,
    nombre: 'Blue Racing',
    presupuesto_total: 2100000,
    conductores: [
      { id_conductor: 6, nombre: 'Sergio Pérez', habilidad_h: 88 },
      { id_conductor: 7, nombre: 'Lando Norris', habilidad_h: 89 },
      { id_conductor: 8, nombre: 'Oscar Piastri', habilidad_h: 88 },
      { id_conductor: 9, nombre: 'Fernando Alonso', habilidad_h: 92 },
      { id_conductor: 10, nombre: 'Esteban Ocon', habilidad_h: 86 },
      { id_conductor: 11, nombre: 'Pierre Gasly', habilidad_h: 87 },
    ],
    aportes: [
      { id_aporte: 7, nombre_patrocinador: 'Oracle', monto: 600000, fecha: '2025-12-01', descripcion: 'Patrocinio principal' },
      { id_aporte: 8, nombre_patrocinador: 'Castrol', monto: 400000, fecha: '2025-12-02', descripcion: 'Aceites' },
      { id_aporte: 9, nombre_patrocinador: 'McLaren', monto: 500000, fecha: '2025-12-03', descripcion: 'Carrocería' },
      { id_aporte: 10, nombre_patrocinador: 'BWT', monto: 350000, fecha: '2025-12-04', descripcion: 'Agua' },
      { id_aporte: 11, nombre_patrocinador: 'Zara', monto: 250000, fecha: '2025-12-05', descripcion: 'Equipamiento' },
    ],
    carros: [
      { id_carro: 3, nombre: 'BR-01', finalizado: true, stats: { p: 32, a: 31, m: 29 } },
      { id_carro: 4, nombre: 'BR-02', finalizado: false, stats: { p: 0, a: 0, m: 0 } },
    ],
  }
];