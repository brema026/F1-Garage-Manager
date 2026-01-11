import { useState } from 'react';
import { SPONSORS } from '../data/SponsorsData';
import { FiEdit, FiPlus, FiX, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { HABILIDAD_COLORES, getHabilidadColor, getHabilidadLabel, formatCurrency, calculateTotalAportes, calculateTotalByTeam, getTotalItems, getCategoriesCount, formatDate, getPartsByCategory, getPartById, calculateCarStats, isCarComplete } from '../utils/helpers';

export function Sponsors() {
  const [selectedSponsor, setSelectedSponsor] = useState(SPONSORS && SPONSORS.length > 0 ? SPONSORS[0] : null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteFormData, setAporteFormData] = useState({ 
    id_equipo: 1, 
    equipo_nombre: 'Red Racing Team',
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    descripcion: ''
  });

  const hasSponsors = SPONSORS && SPONSORS.length > 0;

  const handleCreateSponsor = () => {
    setModalMode('create');
    setFormData({ nombre: '', email: '' });
    setShowModal(true);
  };

  const handleEditSponsor = () => {
    setModalMode('edit');
    setFormData({ nombre: selectedSponsor.nombre, email: selectedSponsor.email });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', email: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(modalMode === 'create' ? 'Crear sponsor:' : 'Editar sponsor:', formData);
    handleCloseModal();
  };

  const handleCreateAporte = () => {
    setShowAporteModal(true);
    setAporteFormData({
      id_equipo: 1,
      equipo_nombre: 'Red Racing Team',
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      descripcion: ''
    });
  };

  const handleCloseAporteModal = () => {
    setShowAporteModal(false);
    setAporteFormData({
      id_equipo: 1,
      equipo_nombre: 'Red Racing Team',
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      descripcion: ''
    });
  };

  const handleAporteSubmit = (e) => {
    e.preventDefault();
    console.log('Registrar aporte para sponsor:', selectedSponsor.id_patrocinador, aporteFormData);
    handleCloseAporteModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            PATROCINADORES
          </h1>
          <p className="text-light/50 text-sm md:text-base">Gestionar patrocinadores y aportes a equipos</p>
        </div>
      </div>

      {/* Estado Vacío */}
      {!hasSponsors ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            {/* Icono */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 rounded-2xl flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sin Patrocinadores Registrados
            </h2>
            <p className="text-light/50 mb-8 text-sm md:text-base">
              Comienza a registrar patrocinadores y sus aportes monetarios a los equipos.
            </p>

            {/* Botón crear */}
            <button
              onClick={handleCreateSponsor}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <FiPlus className="text-xl" />
              REGISTRAR PATROCINADOR
            </button>

            {/* Características */}
            <div className="mt-8 pt-8 border-t border-light/10">
              <p className="text-xs text-light/40 mb-4">CARACTERÍSTICAS</p>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Registra patrocinadores</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Registra aportes monetarios</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Calcula presupuesto de equipos</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Visualiza aportes por fecha y monto</span>
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
                  onClick={handleCreateSponsor}
                  className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                >
                  <FiPlus className="text-lg" />
                  NUEVO PATROCINADOR
                </button>

                {/* Lista de patrocinadores */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">PATROCINADORES ({SPONSORS.length})</h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {SPONSORS.map((sponsor) => (
                      <button
                        key={sponsor.id_patrocinador}
                        onClick={() => setSelectedSponsor(sponsor)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedSponsor.id_patrocinador === sponsor.id_patrocinador
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{sponsor.nombre}</span>
                          <FiChevronRight className={`text-primary transition-transform ${selectedSponsor.id_patrocinador === sponsor.id_patrocinador ? 'translate-x-1' : ''}`} />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">{sponsor.aportes.length} aportes</span>
                          <div className="text-accent font-bold">{formatCurrency(calculateTotalAportes(sponsor.aportes))}</div>
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
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">PATROCINADOR ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedSponsor.nombre}</h2>
                      <p className="text-light/60 text-sm">{selectedSponsor.email}</p>
                    </div>
                    <button
                      onClick={handleEditSponsor}
                      className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                    >
                      <FiEdit />
                      EDITAR
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Total Aportes</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">{formatCurrency(calculateTotalAportes(selectedSponsor.aportes))}</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Aportes</div>
                      <div className="text-2xl md:text-3xl font-black text-blue-400">{selectedSponsor.aportes.length}</div>
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
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Nombre</div>
                    <div className="text-white font-bold">{selectedSponsor.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Email</div>
                    <div className="text-white font-bold break-all">{selectedSponsor.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">ID Patrocinador</div>
                    <div className="text-white font-bold">#{selectedSponsor.id_patrocinador}</div>
                  </div>
                </div>
              </div>

              {/* Aportes */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Registro de Aportes
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Tabla */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-light/10">
                          <th className="text-left py-3 px-4 text-light/50 font-bold uppercase">Fecha</th>
                          <th className="text-left py-3 px-4 text-light/50 font-bold uppercase">Equipo</th>
                          <th className="text-left py-3 px-4 text-light/50 font-bold uppercase">Monto</th>
                          <th className="text-left py-3 px-4 text-light/50 font-bold uppercase">Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSponsor.aportes.map((aporte) => (
                          <tr key={aporte.id_aporte} className="border-b border-light/5 hover:bg-[#1a1f3a]/40 transition-all">
                            <td className="py-3 px-4 text-light/80">{formatDate(aporte.fecha)}</td>
                            <td className="py-3 px-4 text-white font-bold">{aporte.equipo_nombre}</td>
                            <td className="py-3 px-4 text-accent font-bold">{formatCurrency(aporte.monto)}</td>
                            <td className="py-3 px-4 text-light/60">{aporte.descripcion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-light/10 flex justify-end">
                    <div className="text-right">
                      <div className="text-xs text-light/50 mb-1 uppercase font-bold">Total Aportado</div>
                      <div className="text-3xl font-black text-accent">{formatCurrency(calculateTotalAportes(selectedSponsor.aportes))}</div>
                    </div>
                  </div>

                  {/* Nota */}
                  <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-300">
                      <span className="font-bold">Nota:</span> El presupuesto de un equipo se calcula únicamente a partir de los aportes registrados de todos sus patrocinadores.
                    </p>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button 
                  onClick={handleCreateAporte}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50">
                  <FiPlus />
                  REGISTRAR APORTE
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-all">
                  <FiTrash2 />
                  ELIMINAR
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Patrocinador */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white">
                {modalMode === 'create' ? 'NUEVO PATROCINADOR' : 'EDITAR PATROCINADOR'}
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
                  Nombre del Patrocinador
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: Red Bull Racing"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: sponsors@redbull.com"
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

      {/* Modal Aporte */}
      {showAporteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white">
                REGISTRAR APORTE
              </h3>
              <button
                onClick={handleCloseAporteModal}
                className="text-light/50 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAporteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Equipo
                </label>
                <select
                  value={aporteFormData.id_equipo}
                  onChange={(e) => setAporteFormData({ 
                    ...aporteFormData, 
                    id_equipo: parseInt(e.target.value),
                    equipo_nombre: e.target.options[e.target.selectedIndex].text
                  })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                >
                  <option value={1}>Red Racing Team</option>
                  <option value={2}>Blue Racing</option>
                  <option value={3}>Quantum Drive</option>
                  <option value={4}>Phoenix Elite</option>
                  <option value={5}>Silver Surge</option>
                  <option value={6}>TEC Racing Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={aporteFormData.fecha}
                  onChange={(e) => setAporteFormData({ ...aporteFormData, fecha: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Monto (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={aporteFormData.monto}
                  onChange={(e) => setAporteFormData({ ...aporteFormData, monto: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: 500000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={aporteFormData.descripcion}
                  onChange={(e) => setAporteFormData({ ...aporteFormData, descripcion: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: Patrocinio principal"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAporteModal}
                  className="flex-1 py-3 px-4 rounded-lg border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all"
                >
                  REGISTRAR
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

export default Sponsors;