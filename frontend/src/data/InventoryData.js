// src/data/inventoryData.js
// Datos de inventario por equipo

export const INVENTORY = [
  {
    id_inventario: 1,
    id_equipo: 1,
    equipo_nombre: 'Red Racing Team',
    items: [
      {
        id_item: 1,
        id_parte: 2,
        nombre_parte: 'Motor Mejorado',
        categoria: 'Unidad de Potencia',
        cantidad: 2,
        fecha_adquisicion: '2024-12-15',
      },
      {
        id_item: 2,
        id_parte: 3,
        nombre_parte: 'Turbo Avanzado',
        categoria: 'Unidad de Potencia',
        cantidad: 1,
        fecha_adquisicion: '2024-12-14',
      },
      {
        id_item: 3,
        id_parte: 4,
        nombre_parte: 'Alerón Frontal Pro',
        categoria: 'Paquete Aerodinámico',
        cantidad: 3,
        fecha_adquisicion: '2024-12-15',
      },
      {
        id_item: 4,
        id_parte: 5,
        nombre_parte: 'Alerón Trasero Lite',
        categoria: 'Paquete Aerodinámico',
        cantidad: 2,
        fecha_adquisicion: '2024-12-15',
      },
      {
        id_item: 5,
        id_parte: 7,
        nombre_parte: 'Neumáticos Blandos',
        categoria: 'Neumáticos',
        cantidad: 8,
        fecha_adquisicion: '2024-12-10',
      },
      {
        id_item: 6,
        id_parte: 8,
        nombre_parte: 'Neumáticos Duros',
        categoria: 'Neumáticos',
        cantidad: 6,
        fecha_adquisicion: '2024-12-10',
      },
      {
        id_item: 7,
        id_parte: 11,
        nombre_parte: 'Suspensión Fórmula',
        categoria: 'Suspensión',
        cantidad: 1,
        fecha_adquisicion: '2024-12-15',
      },
      {
        id_item: 8,
        id_parte: 12,
        nombre_parte: 'Amortiguador Avanzado',
        categoria: 'Suspensión',
        cantidad: 2,
        fecha_adquisicion: '2024-12-15',
      },
      {
        id_item: 9,
        id_parte: 14,
        nombre_parte: 'Caja de Cambios DRS',
        categoria: 'Caja de Cambios',
        cantidad: 1,
        fecha_adquisicion: '2024-12-12',
      },
    ],
  },
  {
    id_inventario: 2,
    id_equipo: 2,
    equipo_nombre: 'Blue Racing',
    items: [
      {
        id_item: 10,
        id_parte: 1,
        nombre_parte: 'Motor Estándar',
        categoria: 'Unidad de Potencia',
        cantidad: 2,
        fecha_adquisicion: '2024-12-10',
      },
      {
        id_item: 11,
        id_parte: 4,
        nombre_parte: 'Alerón Frontal Pro',
        categoria: 'Paquete Aerodinámico',
        cantidad: 2,
        fecha_adquisicion: '2024-12-12',
      },
      {
        id_item: 12,
        id_parte: 6,
        nombre_parte: 'Difusor Mejorado',
        categoria: 'Paquete Aerodinámico',
        cantidad: 1,
        fecha_adquisicion: '2024-12-12',
      },
      {
        id_item: 13,
        id_parte: 8,
        nombre_parte: 'Neumáticos Duros',
        categoria: 'Neumáticos',
        cantidad: 5,
        fecha_adquisicion: '2024-12-11',
      },
      {
        id_item: 14,
        id_parte: 10,
        nombre_parte: 'Suspensión Estándar',
        categoria: 'Suspensión',
        cantidad: 2,
        fecha_adquisicion: '2024-12-11',
      },
      {
        id_item: 15,
        id_parte: 13,
        nombre_parte: 'Caja de Cambios Estándar',
        categoria: 'Caja de Cambios',
        cantidad: 1,
        fecha_adquisicion: '2024-12-09',
      },
    ],
  },
  {
    id_inventario: 3,
    id_equipo: 3,
    equipo_nombre: 'Quantum Drive',
    items: [
      {
        id_item: 16,
        id_parte: 2,
        nombre_parte: 'Motor Mejorado',
        categoria: 'Unidad de Potencia',
        cantidad: 1,
        fecha_adquisicion: '2024-12-13',
      },
      {
        id_item: 17,
        id_parte: 5,
        nombre_parte: 'Alerón Trasero Lite',
        categoria: 'Paquete Aerodinámico',
        cantidad: 2,
        fecha_adquisicion: '2024-12-13',
      },
      {
        id_item: 18,
        id_parte: 7,
        nombre_parte: 'Neumáticos Blandos',
        categoria: 'Neumáticos',
        cantidad: 4,
        fecha_adquisicion: '2024-12-08',
      },
      {
        id_item: 19,
        id_parte: 11,
        nombre_parte: 'Suspensión Fórmula',
        categoria: 'Suspensión',
        cantidad: 1,
        fecha_adquisicion: '2024-12-14',
      },
      {
        id_item: 20,
        id_parte: 14,
        nombre_parte: 'Caja de Cambios DRS',
        categoria: 'Caja de Cambios',
        cantidad: 1,
        fecha_adquisicion: '2024-12-14',
      },
    ],
  },
];

export const EQUIPOS = [
  { id_equipo: 1, nombre: 'Red Racing Team' },
  { id_equipo: 2, nombre: 'Blue Racing' },
  { id_equipo: 3, nombre: 'Quantum Drive' },
  { id_equipo: 4, nombre: 'Phoenix Elite' },
  { id_equipo: 5, nombre: 'Silver Surge' },
  { id_equipo: 6, nombre: 'TEC Racing Innovation' },
];

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

export const getTotalItems = (items) => {
  return items.reduce((sum, item) => sum + item.cantidad, 0);
};

export const getCategoriesCount = (items) => {
  const categories = {};
  items.forEach((item) => {
    categories[item.categoria] = (categories[item.categoria] || 0) + 1;
  });
  return categories;
};

export const CATEGORIAS = [
  'Todas',
  'Unidad de potencia',
  'Paquete aerodinámico',
  'Neumáticos',
  'Suspensión',
  'Caja de cambios'
];