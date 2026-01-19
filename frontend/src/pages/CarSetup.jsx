import { useState, useMemo, useEffect } from 'react';
import {
  EQUIPOS,
  CARS_BY_TEAM,
  CATEGORIES,
  DRIVERS,
  POTENCIA_PARTS,
  AERODINAMICA_PARTS,
  NEUMATICOS_PARTS,
  SUSPENSION_PARTS,
  CAJA_CAMBIOS_PARTS
} from '../data/CarSetupData';
import {
  getPartsByCategory,
  getPartById,
  calculateCarStats,
  isCarComplete
} from '../utils/helpers';
import { FiCheck, FiChevronDown, FiCheckCircle, FiFlag, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import carImage1 from '../assets/f1-car-1.png';
import carImage2 from '../assets/f1-car-2.png';
import carSetupService from '../services/carSetupService';

// Combinar todas las partes en un array
const ALL_PARTS = [
  ...POTENCIA_PARTS,
  ...AERODINAMICA_PARTS,
  ...NEUMATICOS_PARTS,
  ...SUSPENSION_PARTS,
  ...CAJA_CAMBIOS_PARTS
];

export function CarSetup( { user } ) {
  const [selectedEquipoId, setSelectedEquipoId] = useState(EQUIPOS[0]?.id_equipo || null);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [carSetups, setCarSetups] = useState({});
  const [expandedCategory, setExpandedCategory] = useState('Unidad de Potencia');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carsForTeam = CARS_BY_TEAM[selectedEquipoId] || [];
  const currentTeam = EQUIPOS.find((e) => e.id_equipo === selectedEquipoId);

  // Cargar datos desde API cuando cambia el equipo
  useEffect(() => {
    const loadTeamData = async () => {
      if (!selectedEquipoId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Intentar cargar desde la API
        const carsData = await carSetupService.getTeamCars(selectedEquipoId);
        
        // Inicializar setups con datos de la API
        const newSetups = {};
        carsData.forEach((car) => {
          newSetups[car.id_carro] = {
            id_potencia: car.id_potencia || null,
            id_aerodinamica: car.id_aerodinamica || null,
            id_neumaticos: car.id_neumaticos || null,
            id_suspension: car.id_suspension || null,
            id_caja_cambios: car.id_caja_cambios || null,
            id_conductor: car.id_conductor || null
          };
        });
        
        setCarSetups(newSetups);
        
        if (carsData.length > 0) {
          setSelectedCarId(carsData[0].id_carro);
        }
      } catch (err) {
        // Si la API falla, usar datos locales
        console.warn('Usando datos locales:', err);
        
        if (!carSetups[selectedEquipoId] && carsForTeam.length > 0) {
          const newSetups = {};
          carsForTeam.forEach((car) => {
            newSetups[car.id_carro] = carSetups[car.id_carro] || { ...car.setup };
          });
          setCarSetups((prev) => ({
            ...prev,
            ...newSetups,
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    loadTeamData();
  }, [selectedEquipoId]);

  // Inicializar carro seleccionado
  useEffect(() => {
    if (!selectedCarId && carsForTeam.length > 0) {
      setSelectedCarId(carsForTeam[0].id_carro);
    }
  }, [carsForTeam]);

  const selectedCar = carsForTeam.find((car) => car.id_carro === selectedCarId);
  const currentSetup = carSetups[selectedCarId] || {};
  const carStats = useMemo(() => calculateCarStats(currentSetup, ALL_PARTS), [currentSetup]);
  const selectedDriver = DRIVERS.find((d) => d.id_conductor === currentSetup.id_conductor);

  // Verificar requerimientos (5 categorías + conductor)
  const hasPotencia = !!currentSetup.id_potencia;
  const hasAerodinamica = !!currentSetup.id_aerodinamica;
  const hasNeumaticos = !!currentSetup.id_neumaticos;
  const hasSuspension = !!currentSetup.id_suspension;
  const hasCajaCambios = !!currentSetup.id_caja_cambios;
  const hasConductor = !!currentSetup.id_conductor;

  const allRequirementsMet = hasPotencia && hasAerodinamica && hasNeumaticos && hasSuspension && hasCajaCambios && hasConductor;

  const completedItems = Object.values(currentSetup).filter(Boolean).length;
  const progressPercentage = (completedItems / 6) * 100;

  const carImage = selectedCar?.imagen === 2 ? carImage2 : carImage1;

  const handlePartChange = (category, partId) => {
    setCarSetups((prev) => ({
      ...prev,
      [selectedCarId]: {
        ...prev[selectedCarId],
        [`id_${category.toLowerCase().replace(/ /g, '_')}`]: partId,
      },
    }));
  };

  const handleDriverChange = (driverId) => {
    setCarSetups((prev) => ({
      ...prev,
      [selectedCarId]: {
        ...prev[selectedCarId],
        id_conductor: driverId,
      },
    }));
  };

  const handleFinalizeCar = async () => {
    if (!allRequirementsMet) return;

    try {
      setLoading(true);
      setError(null);

      // Instalar todas las partes
      const categoriasMap = {
        'Unidad de Potencia': [1, currentSetup.id_potencia],
        'Paquete Aerodinámico': [2, currentSetup.id_aerodinamica],
        'Neumáticos': [3, currentSetup.id_neumaticos],
        'Suspensión': [4, currentSetup.id_suspension],
        'Caja de Cambios': [5, currentSetup.id_caja_cambios]
      };

      // Instalar cada parte
      for (const [categoria, [categoryId, pieceId]] of Object.entries(categoriasMap)) {
        if (pieceId) {
          await carSetupService.installPart(selectedCarId, pieceId, categoryId);
        }
      }

      // Asignar conductor
      if (currentSetup.id_conductor) {
        await carSetupService.assignDriver(selectedCarId, currentSetup.id_conductor);
      }

      // Finalizar carro
      await carSetupService.finalizeCar(selectedCarId);

      setSuccessMessage(`¡Carro ${selectedCar.numero_carro} de ${currentTeam.nombre} finalizado exitosamente!`);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Error finalizando el carro');
    } finally {
      setLoading(false);
    }
  };

  const userRole = user.rol?.toLowerCase();
  const hasNoTeam = !user?.id_equipo || String(user?.id_equipo) === "0";
  
  // Engineer without team assigned
  if (hasNoTeam && userRole === 'engineer') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-slate-900/60 border border-red-500/20 p-10 rounded-3xl text-center backdrop-blur-2xl max-w-lg shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">VINCULACIÓN PENDIENTE</h2>
          
          <p className="text-slate-400 leading-relaxed">
            Actualmente no tienes un equipo asignado en el sistema. Para comenzar a gestionar inventarios y telemetría.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Estado: Esperando asignación de equipo
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getDriversForTeam = () => {
    return DRIVERS.filter((d) => d.equipo_id === selectedEquipoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* No Equipos Message */}
      {EQUIPOS.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-[#0f1419] to-transparent border border-primary/30 p-12 backdrop-blur-xl max-w-2xl w-full">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-0"></div>

            <div className="relative z-10 text-center">
              <FiFlag className="text-primary/40 text-8xl mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                Sin Equipos Registrados
              </h1>
              <p className="text-light/60 text-lg mb-3">
                No hay equipos disponibles en este momento.
              </p>
              <p className="text-light/40 text-base">
                Por favor, registra equipos en la base de datos para comenzar a configurar carros.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {EQUIPOS.length > 0 && (
        <>
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-3xl rounded-full"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <FiFlag className="text-primary text-3xl" />
                <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">
                  ARMADO F1
                </h1>
              </div>
              <p className="text-light/50 text-sm md:text-base max-w-2xl">
                Configura tu equipo con carros: selecciona partes de 5 categorías y elige conductor
              </p>
            </div>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Lista de equipos */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">EQUIPOS ({EQUIPOS.length})</h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {EQUIPOS.map((equipo) => (
                      <button
                        key={equipo.id_equipo}
                        onClick={() => setSelectedEquipoId(equipo.id_equipo)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedEquipoId === equipo.id_equipo
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{equipo.nombre}</span>
                          <FiChevronRight className={`text-primary transition-transform ${selectedEquipoId === equipo.id_equipo ? 'translate-x-1' : ''}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">2 carros</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carros Disponibles */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase">Carros</h2>
                  </div>

                  <div className="p-3 space-y-2">
                    {carsForTeam.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-light/50 text-xs font-bold">No hay carros disponibles</p>
                      </div>
                    ) : (
                      carsForTeam.map((car) => {
                        const carComplete = isCarComplete(carSetups[car.id_carro] || {});
                        return (
                          <button
                            key={car.id_carro}
                            onClick={() => setSelectedCarId(car.id_carro)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                              selectedCarId === car.id_carro
                                ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                                : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a]'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white">Carro {car.numero_carro}</span>
                              {carComplete ? (
                                <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                                  <FiCheckCircle className="text-green-400 text-sm" />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                                  <span className="text-xs text-yellow-400 font-bold text-center w-4">
                                    {Object.values(carSetups[car.id_carro] || {}).filter(Boolean).length}/6
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-light/60">{car.descripcion}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="bg-gradient-to-br from-accent/20 via-[#0f1419] to-transparent border border-accent/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-light/50 uppercase font-bold">Progreso</div>
                      <div className="text-2xl font-black text-white mt-1">
                        {completedItems}<span className="text-light/50 text-lg">/6</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <FiTrendingUp className="text-accent text-3xl mb-1" />
                      <div className="text-2xl font-black text-accent">{Math.round(progressPercentage)}%</div>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-[#1a1f3a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent via-red-600 to-red-700 transition-all duration-500 rounded-full shadow-lg shadow-accent/50"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* No Car Selected Message */}
              {!selectedCar && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-[#0f1419] to-transparent border border-primary/30 p-12 backdrop-blur-xl flex items-center justify-center min-h-96">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-0"></div>

                  <div className="relative z-10 text-center">
                    <FiFlag className="text-primary/40 text-8xl mx-auto mb-4" />
                    <h2 className="text-3xl md:text-4xl font-black text-light/50 mb-2">
                      Sin Auto Seleccionado
                    </h2>
                    <p className="text-light/40 text-sm md:text-base max-w-2xl">
                      Selecciona uno de los carros disponibles en el panel izquierdo para comenzar a configurarlo
                    </p>
                  </div>
                </div>
              )}

              {/* Hero Card */}
              {selectedCar && (
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-[#0f1419] to-transparent border border-primary/30 p-8 backdrop-blur-xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-0"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-gradient-to-r from-primary to-red-700 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">En Configuración</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                        Carro {selectedCar.numero_carro}
                      </h2>
                      <p className="text-light/60 text-sm mb-6">{selectedCar.descripcion}</p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 backdrop-blur text-center">
                          <div className="text-xs text-yellow-400 mb-2 uppercase font-bold">P</div>
                          <div className="text-3xl font-black text-yellow-400">{carStats.P}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4 backdrop-blur text-center">
                          <div className="text-xs text-green-400 mb-2 uppercase font-bold">A</div>
                          <div className="text-3xl font-black text-green-400">{carStats.A}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 backdrop-blur text-center">
                          <div className="text-xs text-blue-400 mb-2 uppercase font-bold">M</div>
                          <div className="text-3xl font-black text-blue-400">{carStats.M}</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 rounded-xl p-4 backdrop-blur text-center">
                          <div className="text-xs text-red-400 mb-2 uppercase font-bold">H</div>
                          <div className="text-3xl font-black text-red-400">{selectedDriver?.habilidad_h || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Imagen del Auto */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-transparent rounded-3xl blur-3xl"></div>
                        <img
                          src={carImage}
                          alt="F1 Car"
                          className="relative w-[500px] h-[500px] object-contain drop-shadow-2xl filter brightness-110 ml-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partes - Acordeón */}
              {selectedCar && (
                <div className="space-y-3">
                  {CATEGORIES.map((category) => {
                    const categoryKey = `id_${category.toLowerCase().replace(/ /g, '_')}`;
                    const selectedPartId = currentSetup[categoryKey];
                    const parts = getPartsByCategory(category, ALL_PARTS);
                    const selectedPart = getPartById(selectedPartId, ALL_PARTS);
                    const isExpanded = expandedCategory === category;

                    return (
                      <div
                        key={category}
                        className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
                      >
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1f3a]/30 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider">{category}</h3>
                            {selectedPart && (
                              <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                <FiCheck className="text-green-400 text-xs" />
                                <span className="text-xs text-green-400 font-bold truncate">{selectedPart.nombre}</span>
                              </div>
                            )}
                          </div>
                          <FiChevronDown
                            className={`transition-transform text-light/50 ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="border-t border-light/5 p-6 space-y-4 bg-gradient-to-b from-[#0a0e27]/50 to-transparent">
                            {selectedPart && (
                              <div className="bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="text-xs text-primary font-bold uppercase mb-1 flex items-center gap-2">
                                      <FiCheckCircle className="text-green-400" /> Seleccionada
                                    </div>
                                    <h4 className="text-lg font-bold text-white">{selectedPart.nombre}</h4>
                                    <p className="text-xs text-light/60 mt-1">{selectedPart.descripcion}</p>
                                  </div>
                                  <button
                                    onClick={() => handlePartChange(category, null)}
                                    className="px-3 py-1 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all text-xs font-bold"
                                  >
                                    Cambiar
                                  </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-[#1a1f3a] rounded p-2 text-center">
                                    <div className="text-xs text-yellow-400 font-bold">P</div>
                                    <div className="text-xl font-black text-yellow-400">+{selectedPart.rendimiento.p}</div>
                                  </div>
                                  <div className="bg-[#1a1f3a] rounded p-2 text-center">
                                    <div className="text-xs text-green-400 font-bold">A</div>
                                    <div className="text-xl font-black text-green-400">+{selectedPart.rendimiento.a}</div>
                                  </div>
                                  <div className="bg-[#1a1f3a] rounded p-2 text-center">
                                    <div className="text-xs text-blue-400 font-bold">M</div>
                                    <div className="text-xl font-black text-blue-400">+{selectedPart.rendimiento.m}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-light/60 mb-2 font-bold">Opciones disponibles:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
                                {parts.map((part) => (
                                  <button
                                    key={part.id_parte}
                                    onClick={() => handlePartChange(category, part.id_parte)}
                                    className={`text-left p-3 rounded-lg transition-all group ${
                                      selectedPartId === part.id_parte
                                        ? 'bg-primary/20 border border-primary'
                                        : 'border border-light/10 bg-[#1a1f3a]/50 hover:border-primary/40 hover:bg-[#1a1f3a]'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="text-sm font-bold text-light/80 group-hover:text-white">
                                        {part.nombre}
                                      </span>
                                      <span className="text-xs text-light/50 font-bold">${(part.precio / 1000).toFixed(0)}k</span>
                                    </div>
                                    <div className="flex gap-2 text-xs">
                                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold">P:{part.rendimiento.p}</span>
                                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">A:{part.rendimiento.a}</span>
                                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">M:{part.rendimiento.m}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Conductor */}
              {selectedCar && (
                <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="border-b border-light/5 px-6 py-4">
                    <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent"></span>
                      Conductor
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    {selectedDriver && (
                      <div className="bg-gradient-to-r from-red-500/30 to-red-500/10 border border-red-500/40 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-bold text-white">{selectedDriver.nombre}</h4>
                            <p className="text-xs text-light/60">{selectedDriver.equipo_nombre}</p>
                          </div>
                          <FiCheckCircle className="text-red-400 text-2xl" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-light/60 font-bold">Habilidad</span>
                            <span className="text-sm font-black text-red-400">{selectedDriver.habilidad_h}</span>
                          </div>
                          <div className="w-full h-3 bg-[#1a1f3a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-red-700 shadow-lg shadow-red-500/40"
                              style={{ width: `${(selectedDriver.habilidad_h / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getDriversForTeam().map((driver) => (
                        <button
                          key={driver.id_conductor}
                          onClick={() => handleDriverChange(driver.id_conductor)}
                          className={`text-left p-3 rounded-lg transition-all ${
                            currentSetup.id_conductor === driver.id_conductor
                              ? 'bg-red-500/20 border border-red-500/40'
                              : 'bg-[#1a1f3a]/50 border border-light/10 hover:border-red-400/40 hover:bg-[#1a1f3a]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-bold text-light/80">{driver.nombre}</span>
                            <span className="text-sm font-black text-red-400">{driver.habilidad_h}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones */}
              {selectedCar && (
                <div className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm text-red-300 font-bold">Error</p>
                        <p className="text-xs text-red-300/70 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {allRequirementsMet && !loading && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 animate-pulse">
                      <FiCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-300 font-bold">¡Listo para crear!</p>
                        <p className="text-xs text-green-300/70 mt-1">
                          Tu carro está completamente configurado. Presiona el botón para guardarlo.
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleFinalizeCar}
                    disabled={!allRequirementsMet || loading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-lg ${
                      allRequirementsMet && !loading
                        ? 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-green-700 hover:to-emerald-800 shadow-lg shadow-green-500/50 hover:shadow-green-500/70 cursor-pointer transform hover:scale-105'
                        : 'bg-[#1a1f3a]/50 border border-light/10 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle className="text-xl" />
                        {`CREAR CARRO ${selectedCar?.numero_carro}` || 'CREAR CARRO'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/40 rounded-3xl p-8 max-w-sm w-full backdrop-blur-xl animate-bounce">
            <div className="text-center">
              <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">¡Éxito!</h3>
              <p className="text-light/70 mb-4">{successMessage}</p>
              <div className="text-sm text-green-300 font-bold">Carro guardado exitosamente</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(225, 6, 0, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(225, 6, 0, 0.4);
        }
      `}</style>
    </div>
  );
}

export default CarSetup;