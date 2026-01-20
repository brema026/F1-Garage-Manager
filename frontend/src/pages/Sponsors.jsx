import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { FiEdit, FiPlus, FiX, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { formatCurrency, formatDate } from '../utils/helpers';

export function Sponsors({ user }) {
  const userRole = user?.rol?.toLowerCase();
  const hasNoTeam = !user?.id_equipo || String(user?.id_equipo) === '0';

  // ===== DATA =====
  const [sponsors, setSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);

  // Equipos (para el select del aporte)
  const [teams, setTeams] = useState([]);

  // Aportes (tabla)
  const [contributions, setContributions] = useState([]);

  // Presupuesto del equipo seleccionado
  const [teamBudget, setTeamBudget] = useState(null);

  const hasSponsors = sponsors.length > 0;

  // ===== MODAL SPONSOR =====
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit (edit no implementado)
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [sponsorError, setSponsorError] = useState('');

  // ===== MODAL APORTE =====
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteFormData, setAporteFormData] = useState({
    id_equipo: '',
    fecha: new Date().toISOString().split('T')[0],
    monto: '',
    descripcion: ''
  });
  const [savingAporte, setSavingAporte] = useState(false);
  const [aporteError, setAporteError] = useState('');

  // ===== LOADERS =====
  const [loadingSponsors, setLoadingSponsors] = useState(false);
  const [loadingContrib, setLoadingContrib] = useState(false);

  // ==========================
  // HELPERS
  // ==========================
  const totalAportesSeleccionado = useMemo(() => {
    return contributions.reduce((acc, a) => acc + Number(a.monto || 0), 0);
  }, [contributions]);

  const normalizeContribution = (row) => ({
    id_aporte: row.id_aporte ?? row.id ?? row.aporte_id ?? null,
    id_equipo: row.id_equipo ?? null,
    equipo_nombre: row.nombre_equipo ?? row.equipo ?? row.equipo_nombre ?? row.nombre ?? 'Equipo',
    id_patrocinador: row.id_patrocinador ?? null,
    patrocinador_nombre: row.nombre_patrocinador ?? row.patrocinador ?? null,
    fecha: row.fecha ?? row.fecha_aporte ?? row.fecha_registro ?? null,
    monto: row.monto ?? 0,
    descripcion: row.descripcion ?? ''
  });

  // ==========================
  // LOADERS
  // ==========================
  const cargarSponsors = async () => {
    setLoadingSponsors(true);
    try {
      const res = await api.get('/sponsors');
      const list = res.data || [];
      setSponsors(list);

      if (list.length > 0) {
        setSelectedSponsor((prev) => {
          const prevId = prev?.id_patrocinador;
          const keep = list.find((x) => String(x.id_patrocinador) === String(prevId));
          return keep || list[0];
        });
      } else {
        setSelectedSponsor(null);
      }
    } catch (e) {
      console.error('Error cargando sponsors', e);
      setSponsors([]);
      setSelectedSponsor(null);
    } finally {
      setLoadingSponsors(false);
    }
  };

  const cargarTeams = async () => {
    try {
      // 1) Intenta endpoint típico /teams
      try {
        const res = await api.get('/teams');
        const list = res.data || [];
        if (list.length > 0) {
          setTeams(list);
          return;
        }
      } catch (_) {}

      // 2) Intenta endpoint alterno /sponsors/teams
      try {
        const res2 = await api.get('/sponsors/teams');
        const list2 = res2.data || [];
        if (list2.length > 0) {
          setTeams(list2);
          return;
        }
      } catch (_) {}

      // 3) Fallback (para no romper UI)
      if (userRole === 'engineer' && !hasNoTeam) {
        setTeams([{ id_equipo: Number(user.id_equipo), nombre: 'Mi Equipo' }]);
      } else {
        setTeams([
          { id_equipo: 1, nombre: 'Equipo 1' },
          { id_equipo: 2, nombre: 'Equipo 2' },
          { id_equipo: 3, nombre: 'Equipo 3' }
        ]);
      }
    } catch (e) {
      console.error('Error cargando equipos', e);
    }
  };

  const cargarAportesPorEquipo = async (idEquipo) => {
    if (!idEquipo) return;
    setLoadingContrib(true);
    try {
      const res = await api.get(`/sponsors/contributions/team/${idEquipo}`);
      const rows = (res.data || []).map(normalizeContribution);
      setContributions(rows);
    } catch (e) {
      console.error('Error cargando aportes', e);
      setContributions([]);
    } finally {
      setLoadingContrib(false);
    }
  };

  const cargarPresupuestoEquipo = async (idEquipo) => {
    if (!idEquipo) return;
    try {
      const res = await api.get(`/sponsors/budget/team/${idEquipo}`);
      setTeamBudget(res.data || null);
    } catch (e) {
      console.error('Error cargando presupuesto', e);
      setTeamBudget(null);
    }
  };

  // ==========================
  // EFFECTS (NO CONDICIONALES)
  // ==========================
  useEffect(() => {
    cargarSponsors();
    cargarTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambia sponsor o equipos, cargar aportes/presupuesto del equipo "activo"
  useEffect(() => {
    if (!selectedSponsor) {
      setContributions([]);
      setTeamBudget(null);
      return;
    }

    const defaultTeamId =
      userRole === 'engineer' && !hasNoTeam
        ? Number(user.id_equipo)
        : Number(aporteFormData.id_equipo || teams?.[0]?.id_equipo || 0);

    if (defaultTeamId) {
      // asegura que el select quede seteado
      setAporteFormData((p) => ({ ...p, id_equipo: p.id_equipo || defaultTeamId }));
      cargarAportesPorEquipo(defaultTeamId);
      cargarPresupuestoEquipo(defaultTeamId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSponsor, teams]);

  // ==========================
  // MODALS HANDLERS
  // ==========================
  const handleCreateSponsor = () => {
    setModalMode('create');
    setFormData({ nombre: '', email: '' });
    setSponsorError('');
    setShowModal(true);
  };

  const handleEditSponsor = () => {
    setModalMode('edit');
    setFormData({ nombre: selectedSponsor?.nombre || '', email: selectedSponsor?.email || '' });
    setSponsorError('Editar no está implementado en backend (solo crear).');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', email: '' });
    setSponsorError('');
  };

  const handleSubmitSponsor = async (e) => {
    e.preventDefault();

    if (modalMode === 'edit') return;

    if (userRole !== 'admin') {
      setSponsorError('Solo Admin puede registrar patrocinadores.');
      return;
    }

    setSavingSponsor(true);
    setSponsorError('');

    try {
      await api.post('/sponsors', {
        nombre: formData.nombre,
        email: formData.email
      });

      handleCloseModal();
      await cargarSponsors();
    } catch (err) {
      setSponsorError(err.response?.data?.error || 'Error registrando patrocinador');
    } finally {
      setSavingSponsor(false);
    }
  };

  const handleCreateAporte = () => {
    setAporteError('');
    setShowAporteModal(true);

    const defaultTeamId =
      userRole === 'engineer' && !hasNoTeam
        ? Number(user.id_equipo)
        : Number(aporteFormData.id_equipo || teams?.[0]?.id_equipo || 1);

    setAporteFormData({
      id_equipo: defaultTeamId,
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      descripcion: ''
    });
  };

  const handleCloseAporteModal = () => {
    setShowAporteModal(false);
    setAporteError('');
    setAporteFormData({
      id_equipo: userRole === 'engineer' && !hasNoTeam ? Number(user.id_equipo) : '',
      fecha: new Date().toISOString().split('T')[0],
      monto: '',
      descripcion: ''
    });
  };

  const handleAporteSubmit = async (e) => {
    e.preventDefault();

    if (userRole !== 'admin') {
      setAporteError('Solo Admin puede registrar aportes.');
      return;
    }

    if (!selectedSponsor?.id_patrocinador) {
      setAporteError('No hay patrocinador seleccionado.');
      return;
    }

    const idEquipo = Number(aporteFormData.id_equipo);
    const monto = Number(aporteFormData.monto);

    if (!idEquipo) return setAporteError('Selecciona un equipo.');
    if (!Number.isFinite(monto) || monto <= 0) return setAporteError('Monto inválido.');

    setSavingAporte(true);
    setAporteError('');

    try {
      await api.post('/sponsors/contributions', {
        id_equipo: idEquipo,
        id_patrocinador: Number(selectedSponsor.id_patrocinador),
        monto,
        descripcion: aporteFormData.descripcion,
        fecha: aporteFormData.fecha
      });

      handleCloseAporteModal();

      // refrescar UI: aportes + presupuesto + lista sponsors
      await Promise.all([
        cargarAportesPorEquipo(idEquipo),
        cargarPresupuestoEquipo(idEquipo),
        cargarSponsors()
      ]);
    } catch (err) {
      setAporteError(err.response?.data?.error || 'Error registrando aporte');
    } finally {
      setSavingAporte(false);
    }
  };

  // ==========================
  // RENDER (condiciones aquí, no antes de hooks)
  // ==========================
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
            Actualmente no tienes un equipo asignado en el sistema.
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
            PATROCINADORES
          </h1>
          <p className="text-light/50 text-sm md:text-base">Gestionar patrocinadores y aportes a equipos</p>
        </div>
      </div>

      {!hasSponsors ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sin Patrocinadores Registrados
            </h2>

            <button
              onClick={handleCreateSponsor}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
              disabled={userRole !== 'admin' || savingSponsor}
              title={userRole !== 'admin' ? 'Solo Admin puede registrar patrocinadores' : ''}
            >
              <FiPlus className="text-xl" />
              REGISTRAR PATROCINADOR
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                <button
                  onClick={handleCreateSponsor}
                  className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm disabled:opacity-60"
                  disabled={userRole !== 'admin'}
                >
                  <FiPlus className="text-lg" />
                  NUEVO PATROCINADOR
                </button>

                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                      PATROCINADORES ({sponsors.length})
                    </h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {loadingSponsors ? (
                      <div className="text-light/60 text-sm px-3 py-4">Cargando...</div>
                    ) : (
                      sponsors.map((sponsor) => (
                        <button
                          key={sponsor.id_patrocinador}
                          onClick={() => setSelectedSponsor(sponsor)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                            String(selectedSponsor?.id_patrocinador) === String(sponsor.id_patrocinador)
                              ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                              : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm md:text-base text-white truncate">{sponsor.nombre}</span>
                            <FiChevronRight
                              className={`text-primary transition-transform ${
                                String(selectedSponsor?.id_patrocinador) === String(sponsor.id_patrocinador) ? 'translate-x-1' : ''
                              }`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-light/50">{sponsor.email || 'sin email'}</span>
                            <div className="text-accent font-bold">#{sponsor.id_patrocinador}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#0f1419] to-transparent border border-primary/20 p-8">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">PATROCINADOR ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedSponsor?.nombre}</h2>
                      <p className="text-light/60 text-sm">{selectedSponsor?.email || 'sin email'}</p>
                    </div>

                    <button
                      onClick={handleEditSponsor}
                      className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base disabled:opacity-60"
                      disabled={!selectedSponsor}
                      title="Editar aún no implementado"
                    >
                      <FiEdit />
                      EDITAR
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Total Aportes (equipo)</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">
                        {formatCurrency(totalAportesSeleccionado)}
                      </div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Presupuesto Equipo</div>
                      <div className="text-2xl md:text-3xl font-black text-blue-400">
                        {formatCurrency(Number(teamBudget?.presupuesto ?? teamBudget?.budget ?? 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aportes */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Registro de Aportes
                  </h3>

                  <select
                    value={aporteFormData.id_equipo || ''}
                    onChange={async (e) => {
                      const idEquipo = Number(e.target.value);
                      setAporteFormData((p) => ({ ...p, id_equipo: idEquipo }));
                      await Promise.all([cargarAportesPorEquipo(idEquipo), cargarPresupuestoEquipo(idEquipo)]);
                    }}
                    className="px-3 py-2 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                    disabled={userRole === 'engineer'}
                  >
                    {(teams || []).map((t) => (
                      <option key={t.id_equipo} value={t.id_equipo}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-6 space-y-4">
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
                        {loadingContrib ? (
                          <tr>
                            <td className="py-4 px-4 text-light/60" colSpan={4}>
                              Cargando...
                            </td>
                          </tr>
                        ) : contributions.length === 0 ? (
                          <tr>
                            <td className="py-4 px-4 text-light/60" colSpan={4}>
                              No hay aportes para este equipo.
                            </td>
                          </tr>
                        ) : (
                          contributions.map((aporte) => (
                            <tr
                              key={`${aporte.id_aporte ?? 'x'}-${aporte.fecha}-${aporte.monto}`}
                              className="border-b border-light/5 hover:bg-[#1a1f3a]/40 transition-all"
                            >
                              <td className="py-3 px-4 text-light/80">{formatDate(aporte.fecha)}</td>
                              <td className="py-3 px-4 text-white font-bold">{aporte.equipo_nombre}</td>
                              <td className="py-3 px-4 text-accent font-bold">{formatCurrency(aporte.monto)}</td>
                              <td className="py-3 px-4 text-light/60">{aporte.descripcion}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 border-t border-light/10 flex justify-end">
                    <div className="text-right">
                      <div className="text-xs text-light/50 mb-1 uppercase font-bold">Total Aportado (equipo)</div>
                      <div className="text-3xl font-black text-accent">{formatCurrency(totalAportesSeleccionado)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={handleCreateAporte}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 disabled:opacity-60"
                  disabled={userRole !== 'admin'}
                >
                  <FiPlus />
                  REGISTRAR APORTE
                </button>

                <button
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-all disabled:opacity-60"
                  disabled
                >
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
              <button onClick={handleCloseModal} className="text-light/50 hover:text-white transition-colors">
                <FiX size={24} />
              </button>
            </div>

            {sponsorError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm font-bold">
                {sponsorError}
              </div>
            )}

            <form onSubmit={handleSubmitSponsor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Nombre del Patrocinador
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                  disabled={modalMode === 'edit'}
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
                  disabled={modalMode === 'edit'}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 rounded-lg border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all"
                  disabled={savingSponsor}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-60"
                  disabled={savingSponsor || userRole !== 'admin' || modalMode === 'edit'}
                >
                  {savingSponsor ? 'GUARDANDO...' : 'CREAR'}
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
              <h3 className="text-xl md:text-2xl font-black text-white">REGISTRAR APORTE</h3>
              <button
                onClick={handleCloseAporteModal}
                className="text-light/50 hover:text-white transition-colors"
                disabled={savingAporte}
              >
                <FiX size={24} />
              </button>
            </div>

            {aporteError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm font-bold">
                {aporteError}
              </div>
            )}

            <form onSubmit={handleAporteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Equipo
                </label>
                <select
                  value={aporteFormData.id_equipo || ''}
                  onChange={(e) => setAporteFormData({ ...aporteFormData, id_equipo: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                  disabled={userRole === 'engineer'}
                >
                  {(teams || []).map((t) => (
                    <option key={t.id_equipo} value={t.id_equipo}>
                      {t.nombre}
                    </option>
                  ))}
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
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAporteModal}
                  className="flex-1 py-3 px-4 rounded-lg border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all"
                  disabled={savingAporte}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-60"
                  disabled={savingAporte || userRole !== 'admin'}
                >
                  {savingAporte ? 'REGISTRANDO...' : 'REGISTRAR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(225, 6, 0, 0.2); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(225, 6, 0, 0.4); }
      `}</style>
    </div>
  );
}

export default Sponsors;

