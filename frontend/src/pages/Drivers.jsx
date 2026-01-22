import { useState, useEffect } from 'react';
// import { DRIVERS } from '../data/DriversData';
import { FiEdit, FiPlus, FiX, FiChevronRight } from 'react-icons/fi';
import { HABILIDAD_COLORES, getHabilidadColor, getHabilidadLabel, formatCurrency, calculateTotalAportes, calculateTotalByTeam, getTotalItems, getCategoriesCount, formatDate, getPartsByCategory, getPartById, calculateCarStats, isCarComplete } from '../utils/helpers';
import api from '../api/axios';
import { InputWithValidation } from '../components/common/Validation'; 
import { validateDriverName, validateDriverSkill } from '../utils/validations'; 

// Drivers Page Component
export function Drivers() {
  const [drivers, setDrivers] = useState([]); // Lista de drivers desde la API
  const [selectedDriver, setSelectedDriver] = useState(null); // Driver seleccionado
  const [showModal, setShowModal] = useState(false); // Estado del modal
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [formData, setFormData] = useState({ nombre: '', habilidad_h: 50 }); // Datos del formulario
  const [loading, setLoading] = useState(true); // Estado de carga
  const [teams, setTeams] = useState([]); // Lista de equipos desde la API
  const hasDrivers = drivers && drivers.length > 0; // Verificar si hay drivers
  const [fieldErrors, setFieldErrors] = useState({});
  const handleClearError = (fieldName) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: null }));
  };

  // Cargar drivers y equipos desde la API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversRes, teamsRes] = await Promise.all([
        api.get('/users/drivers'),
        api.get('/teams')
      ]);

      const teamsData = teamsRes.data;
      setTeams(teamsData);

      const dataTransformada = driversRes.data.map(driver => {
        const equipoEncontrado = teamsData.find(t => t.id_equipo === driver.id_equipo);
        
        return {
          ...driver,
          equipo_nombre: equipoEncontrado ? equipoEncontrado.nombre : 'Sin Equipo'
        };
      });

      setDrivers(dataTransformada);

      if (dataTransformada.length > 0 && !selectedDriver) {
        setSelectedDriver(dataTransformada[0]);
      }
      
    } catch (error) {
      console.error("Error al cargar datos:", error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Manejo del modal
  const handleCreateDriver = () => {
    setModalMode('create');
    setFormData({ nombre: '', habilidad_h: 50 });
    setShowModal(true);
  };

  // Editar driver
  const handleEditDriver = () => {
    if (!selectedDriver) return;
    
    setModalMode('edit');
    setFormData({ 
      nombre: selectedDriver.nombre, 
      habilidad_h: selectedDriver.habilidad_h,
      id_equipo: selectedDriver.id_equipo !== null ? Number(selectedDriver.id_equipo) : 0,
      id_usuario: selectedDriver.id_usuario 
    });
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', habilidad_h: 80 });
    setFieldErrors({});
  };

  // Enviar formulario (crear o editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nombreValidation = validateDriverName(formData.nombre);
    if (!nombreValidation.isValid) {
      setFieldErrors({ nombre: nombreValidation.errors[0] });
      return;
    }
    try {
      setLoading(true);

      if (modalMode === 'create') {
        await api.post('/users/drivers', {
          nombre: formData.nombre,
          id_equipo: formData.id_equipo,
          habilidad: formData.habilidad_h
        });
        
      } else {

        await api.patch(`/users/drivers/${selectedDriver.id_driver}/skill`, {
          habilidad: formData.habilidad_h
        });

        await api.put(`/users/${selectedDriver.id_usuario}/assign-team`, {
          id_equipo: formData.id_equipo,
          id_conductor: selectedDriver.id_driver 
        });

        const equipoInfo = teams.find(t => Number(t.id_equipo) === Number(formData.id_equipo));
        
        setSelectedDriver(prev => ({
          ...prev,
          habilidad_h: formData.habilidad_h,
          id_equipo: formData.id_equipo,
          equipo_nombre: equipoInfo ? equipoInfo.nombre : 'Sin Equipo'
        }));
      }

      await fetchData();
      handleCloseModal();

    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while verifying session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            DRIVERS F1
          </h1>
          <p className="text-light/50 text-sm md:text-base">Gestionar y visualizar el desempeño de pilotos</p>
        </div>
      </div>

      {/* Estado Vacío */}
      {!hasDrivers ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            {/* Icono */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 12H9m4 0a4 4 0 00-8 0m8 0H3m8 0v4m0-4V8m0 0h4m-4 0H5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sin Drivers Registrados
            </h2>
            <p className="text-light/50 mb-8 text-sm md:text-base">
              Comienza a registrar drivers. Asigna habilidades y monitorea su desempeño.
            </p>

            {/* Botón crear */}
            <button
              onClick={handleCreateDriver}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <FiPlus className="text-xl" />
              REGISTRAR DRIVER
            </button>

            {/* Características */}
            <div className="mt-8 pt-8 border-t border-light/10">
              <p className="text-xs text-light/40 mb-4">CARACTERÍSTICAS</p>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Asigna niveles de habilidad (0-100)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Visualiza datos del driver</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Consulta estadísticas histórico</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Crea y edita drivers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Grid Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                {/* Botón crear */}
                <button
                  onClick={handleCreateDriver}
                  className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                >
                  <FiPlus className="text-lg" />
                  NUEVO DRIVER
                </button>

                {/* Lista de drivers */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">DRIVERS ({drivers.length})</h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {drivers.map((driver) => (
                      <button
                        key={driver.id_driver}
                        onClick={() => setSelectedDriver(driver)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedDriver.id_driver === driver.id_driver
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{driver.nombre}</span>
                          <FiChevronRight className={`text-primary transition-transform ${selectedDriver.id_driver === driver.id_driver ? 'translate-x-1' : ''}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">{driver.equipo_nombre}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-accent font-bold">{driver.habilidad_h}</span>
                            <span className="text-light/50">H</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Hero Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#0f1419] to-transparent border border-primary/20 p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">DRIVER ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedDriver.nombre}</h2>
                      <p className="text-light/60 text-sm">{selectedDriver.equipo_nombre}</p>
                    </div>
                    <button
                      onClick={handleEditDriver}
                      className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                    >
                      <FiEdit />
                      EDITAR
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Habilidad</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">{selectedDriver.habilidad_h}</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Rango</div>
                      <div className="text-xs md:text-sm font-black text-blue-400">{getHabilidadLabel(selectedDriver.habilidad_h)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Información
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Equipo</div>
                    <div className="text-white font-bold">{selectedDriver.equipo_nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">ID Driver</div>
                    <div className="text-white font-bold">#{selectedDriver.id_driver}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Nivel de Habilidad</div>
                    <div className="w-full h-3 bg-[#1a1f3a] rounded-full overflow-hidden border border-light/10">
                      <div
                        className={`h-full bg-gradient-to-r ${getHabilidadColor(selectedDriver.habilidad_h)}`}
                        style={{ width: `${(selectedDriver.habilidad_h / 100) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-light/50 mt-2">{getHabilidadLabel(selectedDriver.habilidad_h)}</div>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Estadísticas Históricas
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Grid 1 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Carreras</div>
                      <div className="text-2xl font-black text-accent"></div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Victorias</div>
                      <div className="text-2xl font-black text-green-400">{}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Podios</div>
                      <div className="text-2xl font-black text-yellow-400">{}</div>
                    </div>
                  </div>

                  {/* Grid 2 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Pole Positions</div>
                      <div className="text-2xl font-black text-blue-400">{}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Vueltas Rápidas</div>
                      <div className="text-2xl font-black text-purple-400">{}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5 text-center">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold">Campeonatos</div>
                      <div className="text-2xl font-black text-red-400">{}</div>
                    </div>
                  </div>

                  {/* Promedios */}
                  <div className="pt-4 border-t border-light/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold">Promedio Puntos</div>
                        <div className="text-2xl font-black text-accent">{}</div>
                        <div className="text-xs text-light/50 mt-1">por carrera</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[#1a1f3a]/40 border border-light/5">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold">Tasa de Podios</div>
                        <div className="text-2xl font-black text-green-400">
                          %
                        </div>
                        <div className="text-xs text-light/50 mt-1">de carreras</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white">
                {modalMode === 'create' ? 'NUEVO DRIVER' : 'EDITAR DRIVER'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-light/50 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Nombre del Driver
                </label>
                {modalMode === 'edit' ? (
                  <input
                    type="text"
                    readOnly
                    value={formData.nombre}
                    className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white/40 opacity-60 cursor-not-allowed select-none"
                  />
                ) : (
                  <InputWithValidation
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Lewis Hamilton"
                    error={fieldErrors.nombre}
                    onClearError={handleClearError}
                    variant="dark"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Habilidad (0-100)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.habilidad_h}
                    onChange={(e) => setFormData({ ...formData, habilidad_h: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-bold">{formData.habilidad_h}</span>
                    <span className="text-xs text-light/50">{getHabilidadLabel(formData.habilidad_h)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-3">
                  Configuración de Equipo
                </label>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, id_equipo: 0 })}
                  className={`w-full px-4 py-3.5 rounded-lg border transition-all flex items-center justify-between group mb-4 ${
                    Number(formData.id_equipo) === 0
                      ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                      : 'bg-[#1a1f3a]/50 border-light/10 hover:border-primary/40'
                  }`}
                >
                  <span className={`text-sm font-bold uppercase tracking-wide ${Number(formData.id_equipo) === 0 ? 'text-white' : 'text-light/80'}`}>
                    Sin equipo asignado
                  </span>
                  {Number(formData.id_equipo) === 0 ? (
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(225,6,0,0.8)]"></div>
                  ) : (
                    <FiChevronRight className="text-light/20 group-hover:text-primary transition-colors" />
                  )}
                </button>

                <div className="h-px bg-light/5 w-full mb-4"></div>

                {/* LISTA DE EQUIPOS */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {teams
                    .filter(team => Number(team.id_equipo) !== 0)
                    .map((team) => {
                      const isCurrentTeamSelection = Number(team.id_equipo) === Number(formData.id_equipo);

                      return (
                        <button
                          key={team.id_equipo}
                          type="button"
                          onClick={() => setFormData({ ...formData, id_equipo: Number(team.id_equipo) })}
                          className={`w-full px-4 py-3.5 rounded-lg border transition-all flex items-center justify-between group ${
                            isCurrentTeamSelection
                              ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                              : 'bg-[#1a1f3a]/50 border-light/10 hover:border-primary/40'
                          }`}
                        >
                          <span className={`text-sm font-bold uppercase tracking-wide ${isCurrentTeamSelection ? 'text-white' : 'text-light/80'}`}>
                            {team.nombre}
                          </span>
                          {isCurrentTeamSelection ? (
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(225,6,0,0.8)]"></div>
                          ) : (
                            <FiChevronRight className="text-light/20 group-hover:text-primary transition-colors" />
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 rounded-lg border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-50"
                >
                  {loading ? '...' : (modalMode === 'create' ? 'CREAR' : 'GUARDAR')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scrollbar personalizado */}
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

export default Drivers;