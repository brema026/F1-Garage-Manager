export const EQUIPOS = [
  { id_equipo: 1, nombre: 'Red Racing Team' },
  { id_equipo: 2, nombre: 'Blue Racing' }
];

export const CARS_BY_TEAM = {
  1: [
    {
      id_carro: 1,
      id_equipo: 1,
      numero_carro: 1,
      nombre: 'Carro 1',
      descripcion: 'Configuración de velocidad en rectas',
      finalizado: false,
      imagen: 1,
      setup: {
        id_potencia: null,
        id_aerodinamica: null,
        id_neumaticos: null,
        id_suspension: null,
        id_caja_cambios: null,
        id_conductor: null
      },
      fecha_creacion: '2024-12-15',
      ultima_actualizacion: '2024-12-15'
    },
    {
      id_carro: 2,
      id_equipo: 1,
      numero_carro: 2,
      nombre: 'Carro 2',
      descripcion: 'Configuración de agilidad en curvas',
      finalizado: false,
      imagen: 2,
      setup: {
        id_potencia: null,
        id_aerodinamica: null,
        id_neumaticos: null,
        id_suspension: null,
        id_caja_cambios: null,
        id_conductor: null
      },
      fecha_creacion: '2024-12-15',
      ultima_actualizacion: '2024-12-15'
    }
  ],
  2: [
    {
      id_carro: 3,
      id_equipo: 2,
      numero_carro: 1,
      nombre: 'Carro 1',
      descripcion: 'Configuración de velocidad en rectas',
      finalizado: false,
      imagen: 1,
      setup: {
        id_potencia: null,
        id_aerodinamica: null,
        id_neumaticos: null,
        id_suspension: null,
        id_caja_cambios: null,
        id_conductor: null
      },
      fecha_creacion: '2024-12-15',
      ultima_actualizacion: '2024-12-15'
    },
    {
      id_carro: 4,
      id_equipo: 2,
      numero_carro: 2,
      nombre: 'Carro 2',
      descripcion: 'Configuración de agilidad en curvas',
      finalizado: false,
      imagen: 2,
      setup: {
        id_potencia: null,
        id_aerodinamica: null,
        id_neumaticos: null,
        id_suspension: null,
        id_caja_cambios: null,
        id_conductor: null
      },
      fecha_creacion: '2024-12-15',
      ultima_actualizacion: '2024-12-15'
    }
  ]
};

export const POTENCIA_PARTS = [
  {
    id_parte: 1,
    nombre: 'Motor Estándar',
    categoria: 'Unidad de Potencia',
    precio: 250000,
    stock: 5,
    rendimiento: { p: 5, a: 0, m: 0 },
    descripcion: 'Motor base con desempeño estándar'
  },
  {
    id_parte: 2,
    nombre: 'Motor Mejorado',
    categoria: 'Unidad de Potencia',
    precio: 400000,
    stock: 3,
    rendimiento: { p: 8, a: 0, m: 0 },
    descripcion: 'Motor optimizado para máxima potencia'
  }
];

export const AERODINAMICA_PARTS = [
  {
    id_parte: 4,
    nombre: 'Alerón Frontal Pro',
    categoria: 'Paquete Aerodinámico',
    precio: 180000,
    stock: 4,
    rendimiento: { p: 0, a: 6, m: 2 },
    descripcion: 'Alerón frontal para máxima deportividad'
  },
  {
    id_parte: 5,
    nombre: 'Alerón Trasero Lite',
    categoria: 'Paquete Aerodinámico',
    precio: 160000,
    stock: 6,
    rendimiento: { p: 0, a: 5, m: 1 },
    descripcion: 'Alerón trasero ligero para velocidad'
  }
];

export const NEUMATICOS_PARTS = [
  {
    id_parte: 7,
    nombre: 'Neumáticos Blandos',
    categoria: 'Neumáticos',
    precio: 45000,
    stock: 20,
    rendimiento: { p: 1, a: 0, m: 4 },
    descripcion: 'Compuesto blando para máxima tracción'
  },
  {
    id_parte: 8,
    nombre: 'Neumáticos Duros',
    categoria: 'Neumáticos',
    precio: 40000,
    stock: 25,
    rendimiento: { p: 0, a: 0, m: 3 },
    descripcion: 'Compuesto duro para mayor durabilidad'
  }
];

export const SUSPENSION_PARTS = [
  {
    id_parte: 10,
    nombre: 'Suspensión Estándar',
    categoria: 'Suspensión',
    precio: 120000,
    stock: 4,
    rendimiento: { p: 0, a: 0, m: 5 },
    descripcion: 'Suspensión base equilibrada'
  },
  {
    id_parte: 11,
    nombre: 'Suspensión Fórmula',
    categoria: 'Suspensión',
    precio: 200000,
    stock: 2,
    rendimiento: { p: 0, a: 2, m: 8 },
    descripcion: 'Suspensión activa de competición'
  }
];

export const CAJA_CAMBIOS_PARTS = [
  {
    id_parte: 13,
    nombre: 'Caja de Cambios Estándar',
    categoria: 'Caja de Cambios',
    precio: 180000,
    stock: 3,
    rendimiento: { p: 2, a: 0, m: 4 },
    descripcion: 'Caja manual 6 velocidades'
  },
  {
    id_parte: 14,
    nombre: 'Caja de Cambios DRS',
    categoria: 'Caja de Cambios',
    precio: 320000,
    stock: 2,
    rendimiento: { p: 3, a: 1, m: 5 },
    descripcion: 'Caja automática DRS con aerofreno'
  }
];

export const DRIVERS = [
  {
    id_conductor: 1,
    nombre: 'Lewis Hamilton',
    habilidad_h: 95,
    equipo_id: 1,
    equipo_nombre: 'Red Racing Team',
    estadisticas: {
      carreras: 42,
      victorias: 18,
      podios: 35,
      pole_positions: 12,
      vueltas_rapidas: 8,
      campeonatos: 2,
      promedio_puntos: 15.2
    }
  },
  {
    id_conductor: 3,
    nombre: 'George Russell',
    habilidad_h: 90,
    equipo_id: 2,
    equipo_nombre: 'Blue Racing',
    estadisticas: {
      carreras: 85,
      victorias: 3,
      podios: 42,
      pole_positions: 2,
      vueltas_rapidas: 8,
      campeonatos: 0,
      promedio_puntos: 5.5
    }
  }
];

export const CATEGORIES = [
  'Unidad de Potencia',
  'Paquete Aerodinámico',
  'Neumáticos',
  'Suspensión',
  'Caja de Cambios'
];