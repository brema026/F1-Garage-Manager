// ========== DRIVERS HELPERS ==========
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

// ========== SPONSORS HELPERS ==========
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const calculateTotalAportes = (aportes) => {
  return aportes.reduce((sum, aporte) => sum + aporte.monto, 0);
};

export const calculateTotalByTeam = (aportes, teamId) => {
  return aportes
    .filter(aporte => aporte.id_equipo === teamId)
    .reduce((sum, aporte) => sum + aporte.monto, 0);
};

// ========== INVENTORY HELPERS ==========
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

// ========== DATE HELPERS ==========
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// ========== CARSETUP HELPERS ==========
export const getPartsByCategory = (category, allParts) => {
  if (!allParts || !Array.isArray(allParts)) return [];
  return allParts.filter(part => part.categoria === category);
};

export const getPartById = (id, allParts) => {
  if (!allParts || !Array.isArray(allParts) || !id) return null;
  return allParts.find(part => part.id_parte === id);
};

export const calculateCarStats = (setup, allParts) => {
  let totalP = 0, totalA = 0, totalM = 0;

  if (!setup || !allParts || !Array.isArray(allParts)) {
    return { P: 0, A: 0, M: 0 };
  }

  const partIds = [
    setup.id_potencia,
    setup.id_aerodinamica,
    setup.id_neumaticos,
    setup.id_suspension,
    setup.id_caja_cambios
  ];

  partIds.forEach(partId => {
    if (partId) {
      const part = getPartById(partId, allParts);
      if (part && part.rendimiento) {
        totalP += part.rendimiento.p || 0;
        totalA += part.rendimiento.a || 0;
        totalM += part.rendimiento.m || 0;
      }
    }
  });

  return { P: totalP, A: totalA, M: totalM };
};

export const isCarComplete = (setup) => {
  if (!setup) return false;
  return (
    setup.id_potencia &&
    setup.id_aerodinamica &&
    setup.id_neumaticos &&
    setup.id_suspension &&
    setup.id_caja_cambios &&
    setup.id_conductor
  );
};