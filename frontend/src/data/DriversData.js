export const DRIVERS = [
  {
    id_driver: 1,
    nombre: 'Lewis Hamilton',
    habilidad_h: 95,
    id_equipo: 1,
    equipo_nombre: 'Red Racing Team',
    estadisticas: {
      carreras: 328,
      victorias: 103,
      podios: 196,
      pole_positions: 104,
      vueltas_rapidas: 65,
      promedio_puntos: 8.2,
      campeonatos: 7,
    },
  },
  {
    id_driver: 2,
    nombre: 'George Russell',
    habilidad_h: 90,
    id_equipo: 1,
    equipo_nombre: 'Red Racing Team',
    estadisticas: {
      carreras: 85,
      victorias: 3,
      podios: 42,
      pole_positions: 2,
      vueltas_rapidas: 8,
      promedio_puntos: 5.5,
      campeonatos: 0,
    },
  },
];

export const HABILIDAD_COLORES = {
  excelente: 'from-green-500 to-green-400',
  muy_bueno: 'from-blue-500 to-blue-400',
  bueno: 'from-yellow-500 to-yellow-400',
  regular: 'from-orange-500 to-orange-400',
  bajo: 'from-red-500 to-red-400',
};

export const getHabilidadColor = (habilidad) => {
  if (habilidad >= 90) return HABILIDAD_COLORES.excelente;
  if (habilidad >= 80) return HABILIDAD_COLORES.muy_bueno;
  if (habilidad >= 70) return HABILIDAD_COLORES.bueno;
  if (habilidad >= 60) return HABILIDAD_COLORES.regular;
  return HABILIDAD_COLORES.bajo;
};

export const getHabilidadLabel = (habilidad) => {
  if (habilidad >= 90) return 'Excelente';
  if (habilidad >= 80) return 'Muy Bueno';
  if (habilidad >= 70) return 'Bueno';
  if (habilidad >= 60) return 'Regular';
  return 'Bajo';
};