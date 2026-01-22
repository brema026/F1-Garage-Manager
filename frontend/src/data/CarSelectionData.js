// EQUIPOS
export const equipos = [
  { id_equipo: 1, nombre: "Red Bull Racing" },
  { id_equipo: 2, nombre: "Scuderia Ferrari" },
  { id_equipo: 3, nombre: "Mercedes-AMG Petronas" },
  { id_equipo: 4, nombre: "McLaren Racing" },
  { id_equipo: 5, nombre: "Aston Martin" },
];

// CONDUCTORES
export const conductores = [
  { id_conductor: 1, id_equipo: 1, nombre: "Max Verstappen", habilidad_h: 95 },
  { id_conductor: 2, id_equipo: 1, nombre: "Sergio Pérez", habilidad_h: 82 },
  { id_conductor: 3, id_equipo: 2, nombre: "Charles Leclerc", habilidad_h: 90 },
  { id_conductor: 4, id_equipo: 2, nombre: "Carlos Sainz", habilidad_h: 85 },
  { id_conductor: 5, id_equipo: 3, nombre: "Lewis Hamilton", habilidad_h: 93 },
  { id_conductor: 6, id_equipo: 3, nombre: "George Russell", habilidad_h: 86 },
  { id_conductor: 7, id_equipo: 4, nombre: "Lando Norris", habilidad_h: 88 },
  { id_conductor: 8, id_equipo: 4, nombre: "Oscar Piastri", habilidad_h: 80 },
  { id_conductor: 9, id_equipo: 5, nombre: "Fernando Alonso", habilidad_h: 89 },
  { id_conductor: 10, id_equipo: 5, nombre: "Lance Stroll", habilidad_h: 72 },
];

// CARROS CON STATS CALCULADOS
export const carrosConSetup = [
  {
    id_carro: 1,
    id_equipo: 1,
    nombre: "RB20 #1",
    finalizado: true,
    id_conductor: 1,
    P: 42,
    A: 38,
    M: 40,
  },
  {
    id_carro: 2,
    id_equipo: 1,
    nombre: "RB20 #11",
    finalizado: true,
    id_conductor: 2,
    P: 40,
    A: 39,
    M: 41,
  },
  {
    id_carro: 3,
    id_equipo: 2,
    nombre: "SF-24 #16",
    finalizado: true,
    id_conductor: 3,
    P: 39,
    A: 42,
    M: 38,
  },
  {
    id_carro: 4,
    id_equipo: 2,
    nombre: "SF-24 #55",
    finalizado: true,
    id_conductor: 4,
    P: 38,
    A: 41,
    M: 40,
  },
  {
    id_carro: 5,
    id_equipo: 3,
    nombre: "W15 #44",
    finalizado: true,
    id_conductor: 5,
    P: 40,
    A: 40,
    M: 39,
  },
  {
    id_carro: 6,
    id_equipo: 3,
    nombre: "W15 #63",
    finalizado: true,
    id_conductor: 6,
    P: 39,
    A: 40,
    M: 40,
  },
  {
    id_carro: 7,
    id_equipo: 4,
    nombre: "MCL38 #4",
    finalizado: true,
    id_conductor: 7,
    P: 37,
    A: 43,
    M: 39,
  },
  {
    id_carro: 8,
    id_equipo: 4,
    nombre: "MCL38 #81",
    finalizado: true,
    id_conductor: 8,
    P: 36,
    A: 42,
    M: 41,
  },
  {
    id_carro: 9,
    id_equipo: 5,
    nombre: "AMR24 #14",
    finalizado: true,
    id_conductor: 9,
    P: 35,
    A: 38,
    M: 43,
  },
  {
    id_carro: 10,
    id_equipo: 5,
    nombre: "AMR24 #18",
    finalizado: false, // No puede participar en carrera
    id_conductor: 10,
    P: 28,
    A: 30,
    M: 35,
  },
];

// ==========================================
// FUNCIONES HELPER
// ==========================================

/**
 * Obtiene un equipo por ID
 */
export const getEquipoById = (id_equipo) => {
  return equipos.find((e) => e.id_equipo === id_equipo);
};

/**
 * Obtiene un conductor por ID
 */
export const getConductorById = (id_conductor) => {
  return conductores.find((c) => c.id_conductor === id_conductor);
};

/**
 * Obtiene un carro con todos sus datos relacionados
 */
export const getCarroCompleto = (id_carro) => {
  const carro = carrosConSetup.find((c) => c.id_carro === id_carro);
  if (!carro) return null;

  return {
    ...carro,
    equipo: getEquipoById(carro.id_equipo),
    conductor: getConductorById(carro.id_conductor),
  };
};

/**
 * Obtiene todos los carros con datos completos
 */
export const getAllCarrosCompletos = () => {
  return carrosConSetup.map((c) => getCarroCompleto(c.id_carro));
};

/**
 * Obtiene solo carros finalizados (válidos para carrera)
 */
export const getCarrosFinalizados = () => {
  return getAllCarrosCompletos().filter((c) => c.finalizado);
};