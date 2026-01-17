import { useState } from 'react';
import { TEAMS } from '../data/TeamsData';
import { FiEdit, FiPlus, FiX, FiChevronRight } from 'react-icons/fi';

export function Teams( { user } ) {
  const [selectedTeam, setSelectedTeam] = useState(TEAMS && TEAMS.length > 0 ? TEAMS[0] : null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '' });

  const hasTeams = TEAMS && TEAMS.length > 0;

  const handleCreateTeam = () => {
    setModalMode('create');
    setFormData({ nombre: '' });
    setShowModal(true);
  };

  const handleEditTeam = () => {
    setModalMode('edit');
    setFormData({ nombre: selectedTeam.nombre });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(modalMode === 'create' ? 'Crear equipo:' : 'Editar equipo:', formData);
    handleCloseModal();
  };

  const userRole = user.rol?.toLowerCase();
  const userTeamId = Number(user?.id_equipo);

  const showTeams = userRole === 'admin'
    ? TEAMS
    : TEAMS.filter(team => team.id_equipo === userTeamId);

  const [selectedTeam1, setSelectedTeam1] = useState(showTeams.length > 0 ? showTeams[0] : null);

  if (userRole == 'driver') {
    return null;
  }

  // Engineer without team assigned
  if (userRole === 'engineer' && userTeamId === 0) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            EQUIPOS F1
          </h1>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Titulo */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sin Equipos Registrados
            </h2>
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
                <button
                  onClick={handleCreateTeam}
                  className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                >
                  <FiPlus className="text-lg" />
                  NUEVO EQUIPO
                </button>

                {/* Lista de equipos */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">EQUIPOS ({TEAMS.length})</h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {TEAMS.map((team) => (
                      <button
                        key={team.id_equipo}
                        onClick={() => setSelectedTeam(team)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedTeam.id_equipo === team.id_equipo
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{team.nombre}</span>
                          <FiChevronRight className={`text-primary transition-transform ${selectedTeam.id_equipo === team.id_equipo ? 'translate-x-1' : ''}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">{team.conductores.length} pilotos</span>
                          <span className="text-accent font-bold">${(team.presupuesto_total / 1000000).toFixed(1)}M</span>
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
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">EQUIPO ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white">{selectedTeam.nombre}</h2>
                    </div>
                    <button
                      onClick={handleEditTeam}
                      className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                    >
                      <FiEdit />
                      EDITAR
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Presupuesto</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">${(selectedTeam.presupuesto_total / 1000000).toFixed(2)}M</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Pilotos</div>
                      <div className="text-2xl md:text-3xl font-black text-blue-400">{selectedTeam.conductores.length}</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Carros</div>
                      <div className="text-2xl md:text-3xl font-black text-green-400">{selectedTeam.carros.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Pilotos y Patrocinadores */}
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
                    {selectedTeam.conductores.map((conductor) => (
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
                    {selectedTeam.aportes.map((aporte) => (
                      <div key={aporte.id_aporte} className="p-3 rounded-lg bg-[#1a1f3a]/40 border border-light/5 hover:border-accent/30 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-bold text-white text-sm md:text-base">{aporte.nombre_patrocinador}</div>
                            <div className="text-xs text-light/50 mt-1">{aporte.descripcion}</div>
                          </div>
                          <div className="text-accent font-black text-sm md:text-base ml-2">${(aporte.monto / 1000).toFixed(0)}k</div>
                        </div>
                        <div className="mt-2 w-full h-1 bg-[#1a1f3a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-yellow-500"
                            style={{ width: `${(aporte.monto / 800000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Carros */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Carros en Configuración
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto custom-scrollbar">
                  {selectedTeam.carros.map((carro) => (
                    <div
                      key={carro.id_carro}
                      className="p-5 rounded-xl bg-[#1a1f3a]/40 border border-light/5 hover:border-primary/30 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-sm text-light/50 mb-1">CARRO</div>
                          <div className="text-lg md:text-2xl font-black text-white">{carro.nombre}</div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          carro.finalizado
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {carro.finalizado ? '✓ LISTO' : 'EN PROGRESO'}
                        </div>
                      </div>

                      {carro.finalizado && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                              <div className="text-xs text-yellow-400 uppercase font-bold">P</div>
                              <div className="text-lg font-black text-yellow-400">{carro.stats.p}</div>
                            </div>
                            <div className="text-center p-2 rounded bg-green-500/10 border border-green-500/30">
                              <div className="text-xs text-green-400 uppercase font-bold">A</div>
                              <div className="text-lg font-black text-green-400">{carro.stats.a}</div>
                            </div>
                            <div className="text-center p-2 rounded bg-blue-500/10 border border-blue-500/30">
                              <div className="text-xs text-blue-400 uppercase font-bold">M</div>
                              <div className="text-lg font-black text-blue-400">{carro.stats.m}</div>
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
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: Red Racing Team"
                  required
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
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all"
                >
                  {modalMode === 'create' ? 'CREAR' : 'GUARDAR'}
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

export default Teams;