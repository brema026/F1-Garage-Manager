import { useEffect, useState } from 'react';
// import { TEAMS } from '../data/TeamsData';
import { FiEdit, FiPlus, FiX, FiChevronRight } from 'react-icons/fi';
import api from '../api/axios';
import { InputWithValidation } from '../components/common/Validation';
import { validateTeamName } from '../utils/validations';

// Teams Page Component
export function Teams({ user }) {
  const [teams, setTeams] = useState([]); // Lista de equipos
  const [loading, setLoading] = useState(true); // Estado de carga
  const [selectedTeam, setSelectedTeam] = useState(null); // Equipo seleccionado
  const [showModal, setShowModal] = useState(false); // Estado del modal
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [formData, setFormData] = useState({ nombre: '' }); // Datos del formulario
  const [submitting, setSubmitting] = useState(false); // Estado de envío del formulario

  const [engineers, setEngineers] = useState([]); // Lista de ingenieros
  const [showAssignModal, setShowAssignModal] = useState(false); // Estado del modal de asignación
  const [selectedEngineer, setSelectedEngineer] = useState(null); // Ingeniero seleccionado

  const [fieldErrors, setFieldErrors] = useState({});

  const [teamFinance, setTeamFinance] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  const userRole = user?.rol?.toLowerCase(); // Rol del usuario
  const userTeamId = Number(user?.id_equipo); // ID del equipo del usuario

  const handleClearError = (fieldName) => {
    setFieldErrors((prev) => ({ ...prev, [fieldName]: null }));
  };

  // Filtrar equipos según rol
  const filteredTeams =
    userRole === 'admin'
      ? teams.filter((t) => Number(t.id_equipo) !== 0)
      : teams.filter((t) => Number(t.id_equipo) === userTeamId && Number(t.id_equipo) !== 0);

  const hasTeams = filteredTeams.length > 0; // Verificar si hay equipos disponibles

  // Cargar equipos desde la API
  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      const data = response.data;
      setTeams(data);

      if (data && data.length > 0) {
        if (userRole === 'admin') {
          const firstValidTeam = data.find((t) => Number(t.id_equipo) !== 0);
          setSelectedTeam((prev) => data.find((t) => t.id_equipo === prev?.id_equipo) || firstValidTeam);
        } else {
          const myTeam = data.find((t) => Number(t.id_equipo) === userTeamId);
          setSelectedTeam(myTeam || null);
        }
      } else {
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Error cargando equipos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar Presupuesto desde la API
  const fetchTeamFinance = async (idEquipo) => {
    if (!idEquipo || Number(idEquipo) === 0) {
      setTeamFinance(null);
      return;
    }

    setLoadingFinance(true);
    try {
      const res = await api.get(`/teams/${idEquipo}/finance`);
      setTeamFinance(res.data || null);
    } catch (e) {
      console.error('Error cargando finanzas del equipo:', e);
      setTeamFinance(null);
    } finally {
      setLoadingFinance(false);
    }
  };

  // Cargar ingenieros
  const fetchEngineers = async () => {
    try {
      const response = await api.get('/users/engineers');
      setEngineers(response.data);
    } catch (error) {
      console.error('Error cargando ingenieros:', error);
    }
  };

  // ✅ ÚNICO useEffect para cargar data inicial (evita duplicados)
  useEffect(() => {
    if (userRole === 'driver') return;

    fetchTeams();

    if (userRole === 'admin') {
      fetchEngineers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, userTeamId]);

  // Cargar presupuesto cuando cambia el equipo seleccionado
  useEffect(() => {
    const idEquipo = Number(selectedTeam?.id_equipo);
    if (idEquipo) fetchTeamFinance(idEquipo);
    else setTeamFinance(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam?.id_equipo]);

  // Asignar equipo a ingeniero
  const handleAssignTeam = async (teamId) => {
    try {
      await api.put(`/users/${selectedEngineer.id_usuario}/assign-team`, {
        id_equipo: teamId,
      });

      // Refrescar datos y cerrar modal
      await fetchEngineers();
      await fetchTeams();
      setShowAssignModal(false);
      setSelectedEngineer(null);
    } catch (error) {
      alert('Error al asignar equipo');
    }
  };

  // Crear nuevo equipo
  const handleCreateTeam = () => {
    setModalMode('create');
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  // Editar equipo
  const handleEditTeam = () => {
    setModalMode('edit');
    setFormData({ nombre: selectedTeam?.nombre || '' });
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '' });
    setFieldErrors({});
  };

  // Formulario submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombreValidation = validateTeamName(formData.nombre);
    if (!nombreValidation.isValid) {
      setFieldErrors({ nombre: nombreValidation.errors[0] });
      return;
    }

    setSubmitting(true);

    try {
      if (modalMode === 'create') {
        const response = await api.post('/teams', { nombre: formData.nombre });
        if (!selectedTeam) setSelectedTeam(response.data);
      } else {
        await api.put(`/teams/${selectedTeam.id_equipo}`, { nombre: formData.nombre });
      }

      await fetchTeams();
      handleCloseModal();
    } catch (error) {
      console.error('Error al procesar equipo:', error);
      alert(error.response?.data?.error || 'Error en el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  // No mostrar nada a conductores
  if (userRole === 'driver') {
    return null;
  }

  // Show loading spinner while verifying session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Engineer without team assigned
  if (userRole === 'engineer' && userTeamId === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-slate-900/60 border border-red-500/20 p-10 rounded-3xl text-center backdrop-blur-2xl max-w-lg shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-500/10 rounded-full">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 15c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-white text-2xl font-bold mb-4 tracking-tight">VINCULACIÓN PENDIENTE</h2>

          <p className="text-slate-400 leading-relaxed">Actualmente no tienes un equipo asignado en el sistema.</p>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Estado: Esperando asignación de equipo</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">EQUIPOS F1</h1>
          <p className="text-light/50 text-sm md:text-base">Gestionar y monitorear el desempeño de los equipos</p>
        </div>
      </div>

      {/* Estado Vacío */}
      {!hasTeams ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            {/* Icono */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Titulo */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Sin Equipos Registrados</h2>
            <p className="text-light/50 mb-8 text-sm md:text-base">
              Comienza a crear tu primer equipo de Fórmula 1. Configura tus pilotos, patrocinadores y carros.
            </p>

            {/* Botón crear */}
            <button
              onClick={handleCreateTeam}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <FiPlus className="text-xl" />
              CREAR PRIMER EQUIPO
            </button>

            {/* Características */}
            <div className="mt-8 pt-8 border-t border-light/10">
              <p className="text-xs text-light/40 mb-4">CARACTERÍSTICAS</p>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Gestiona pilotos y conductores</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Registra patrocinadores y aportes</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Configura carros y armados</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Monitorea presupuesto y performance</span>
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
                {userRole === 'admin' && (
                  <button
                    onClick={handleCreateTeam}
                    className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                  >
                    <FiPlus className="text-lg" />
                    NUEVO EQUIPO
                  </button>
                )}

                {/* Lista de equipos */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                      EQUIPOS ({filteredTeams.length})
                    </h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {filteredTeams.map((team) => (
                      <button
                        key={team.id_equipo}
                        onClick={() => setSelectedTeam(team)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedTeam?.id_equipo === team.id_equipo
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{team.nombre}</span>
                          <FiChevronRight
                            className={`text-primary transition-transform ${
                              selectedTeam?.id_equipo === team.id_equipo ? 'translate-x-1' : ''
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">{team.conductores?.length || 0} pilotos</span>

                          {/* ✅ SALDO REAL viene del SP /teams */}
                          <span className="text-accent font-bold">
                            Saldo: ${((Number(team.saldo_disponible ?? 0)) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Ingenieros (Solo Admin) */}
                {userRole === 'admin' && (
                  <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden mt-6">
                    <div className="p-4 border-b border-light/5">
                      <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                        INGENIEROS ({engineers.length})
                      </h2>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto px-3 py-3 custom-scrollbar">
                      {engineers.map((eng) => (
                        <button
                          key={eng.id_usuario}
                          onClick={() => {
                            setSelectedEngineer(eng);
                            setShowAssignModal(true);
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl transition-all duration-300 bg-[#1a1f3a]/30 border border-light/5 hover:border-primary/50 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="truncate pr-2">
                              <span className="font-bold text-sm text-white block truncate">{eng.nombre}</span>
                              <span className="text-[10px] text-light/40 uppercase">
                                {eng.id_equipo ? `ID Equipo: ${eng.id_equipo}` : 'SIN EQUIPO'}
                              </span>
                            </div>
                            <div
                              className={`flex-shrink-0 w-2 h-2 rounded-full ${
                                eng.id_equipo ? 'bg-green-500' : 'bg-red-600 animate-pulse'
                              }`}
                            ></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Card */}
              {selectedTeam && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#0f1419] to-transparent border border-primary/20 p-8">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-8">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="text-xs font-bold text-primary uppercase tracking-widest">EQUIPO ACTUAL</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">{selectedTeam.nombre}</h2>
                      </div>
                      {userRole === 'admin' && (
                        <button
                          onClick={handleEditTeam}
                          className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                        >
                          <FiEdit />
                          EDITAR
                        </button>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">
                          Presupuesto (Total Aportado)
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-accent">
                          {loadingFinance
                            ? '...'
                            : `$${((Number(teamFinance?.presupuesto_total ?? 0)) / 1000000).toFixed(2)}M`}
                        </div>
                      </div>

                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Gastado</div>
                        <div className="text-2xl md:text-3xl font-black text-red-400">
                          {loadingFinance
                            ? '...'
                            : `$${((Number(teamFinance?.gasto_total ?? 0)) / 1000000).toFixed(2)}M`}
                        </div>
                      </div>

                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Saldo</div>
                        <div className="text-2xl md:text-3xl font-black text-blue-400">
                          {loadingFinance
                            ? '...'
                            : `$${((Number(teamFinance?.saldo_disponible ?? 0)) / 1000000).toFixed(2)}M`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Pilotos y Patrocinadores */}
              {selectedTeam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pilotos */}
                  <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                    <div className="border-b border-light/5 px-6 py-4">
                      <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        Pilotos
                      </h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {selectedTeam.conductores?.map((conductor) => (
                        <div key={conductor.id_conductor} className="group">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-[#1a1f3a]/40 border border-light/5 hover:border-blue-400/30 transition-all">
                            <div className="flex-1">
                              <div className="font-bold text-white text-sm md:text-base">{conductor.nombre}</div>
                              <div className="text-xs text-light/50 mt-1">Habilidad</div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-black text-blue-400">{conductor.habilidad_h}</div>
                            </div>
                          </div>
                          <div className="mt-1 w-full h-1 bg-[#1a1f3a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                              style={{ width: `${(conductor.habilidad_h / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patrocinadores */}
                  <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                    <div className="border-b border-light/5 px-6 py-4">
                      <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        Patrocinadores
                      </h3>
                    </div>

                    <div className="p-4 space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {selectedTeam.patrocinadores?.map((p) => (
                        <div
                          key={p.id_patrocinador}
                          className="p-3 rounded-lg bg-[#1a1f3a]/40 border border-light/5 hover:border-accent/30 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-white text-sm md:text-base">
                                {p.nombre}
                              </div>

                              <div className="text-xs text-light/50 mt-1">
                                {p.email || 'Sin email'}
                              </div>

                              <div className="text-[10px] text-light/40 mt-1">
                                Último aporte:{' '}
                                {p.ultimo_aporte ? String(p.ultimo_aporte).slice(0, 10) : '—'}
                              </div>
                            </div>

                            <div className="text-accent font-black text-sm md:text-base ml-2">
                              ${((Number(p.total_aportado || 0)) / 1000).toFixed(0)}k
                            </div>
                          </div>

                          {/* Barra visual opcional basada en total aportado */}
                          <div className="mt-2 w-full h-1 bg-[#1a1f3a] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent to-yellow-500"
                              style={{
                                width: `${Math.min(((Number(p.total_aportado || 0)) / 800000) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* Carros */}
              {selectedTeam && (
                <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="border-b border-light/5 px-6 py-4">
                    <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Carros en Configuración
                    </h3>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                    {selectedTeam.carros?.map((carro) => (
                      <div
                        key={carro.id_carro}
                        className="p-5 rounded-xl bg-[#1a1f3a]/40 border border-light/5 hover:border-primary/30 transition-all group cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-sm text-light/50 mb-1">CARRO</div>
                            <div className="text-lg md:text-2xl font-black text-white">{carro.nombre}</div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              carro.finalizado ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {carro.finalizado ? '✓ LISTO' : 'EN PROGRESO'}
                          </div>
                        </div>

                        {carro.finalizado && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-center p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                                <div className="text-xs text-yellow-400 uppercase font-bold">P</div>
                                <div className="text-lg font-black text-yellow-400">{carro.stats?.p}</div>
                              </div>
                              <div className="text-center p-2 rounded bg-green-500/10 border border-green-500/30">
                                <div className="text-xs text-green-400 uppercase font-bold">A</div>
                                <div className="text-lg font-black text-green-400">{carro.stats?.a}</div>
                              </div>
                              <div className="text-center p-2 rounded bg-blue-500/10 border border-blue-500/30">
                                <div className="text-xs text-blue-400 uppercase font-bold">M</div>
                                <div className="text-lg font-black text-blue-400">{carro.stats?.m}</div>
                              </div>
                            </div>
                            <button className="w-full text-xs font-bold text-primary hover:text-red-600 py-2 transition-colors">
                              VER SETUP →
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                {modalMode === 'create' ? 'NUEVO EQUIPO' : 'EDITAR EQUIPO'}
              </h3>
              <button onClick={handleCloseModal} className="text-light/50 hover:text-white transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Nombre del Equipo
                </label>
                <InputWithValidation
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ nombre: e.target.value })}
                  placeholder="Ej: Red Racing Team"
                  error={fieldErrors.nombre}
                  onClearError={handleClearError}
                  variant="dark"
                />
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
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-60"
                >
                  {modalMode === 'create' ? 'CREAR' : 'GUARDAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Equipo a Ingeniero */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Vincular Equipo</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-light/50 hover:text-white transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                Seleccionar Equipo para: <span className="text-primary">{selectedEngineer?.nombre}</span>
              </label>
            </div>

            {/* Lista de Equipos Reales (Filtrada y Ordenada) */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {teams
                .filter((team) => Number(team.id_equipo) !== 0)
                .sort((a, b) => {
                  if (a.id_equipo === selectedEngineer?.id_equipo) return -1;
                  if (b.id_equipo === selectedEngineer?.id_equipo) return 1;
                  return 0;
                })
                .map((team) => {
                  const isCurrentTeam = team.id_equipo === selectedEngineer?.id_equipo;

                  return (
                    <button
                      key={team.id_equipo}
                      onClick={() => handleAssignTeam(team.id_equipo)}
                      className={`w-full px-4 py-3.5 rounded-lg border transition-all flex items-center justify-between group ${
                        isCurrentTeam
                          ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                          : 'bg-[#1a1f3a]/50 border-light/10 hover:border-primary/40'
                      }`}
                    >
                      <span className={`text-sm font-bold uppercase tracking-wide ${isCurrentTeam ? 'text-white' : 'text-light/80'}`}>
                        {team.nombre}
                      </span>
                      {isCurrentTeam ? (
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(225,6,0,0.8)]"></div>
                      ) : (
                        <FiChevronRight className="text-light/20 group-hover:text-primary transition-colors" />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Sección de Acciones de Control */}
            <div className="mt-6 pt-6 border-t border-light/10 space-y-3">
              {/* Botón de Desasignar (Solo si tiene un equipo actualmente) */}
              {Number(selectedEngineer?.id_equipo) !== 0 && (
                <button
                  onClick={() => handleAssignTeam(0)}
                  className="w-full py-3 px-4 rounded-lg bg-red-600/10 border border-red-600/20 text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <FiX className="text-sm" />
                  Desasignar Equipo Actual
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-full py-3 px-4 rounded-lg border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all uppercase text-sm tracking-widest"
              >
                Cancelar
              </button>
            </div>
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

export default Teams;
