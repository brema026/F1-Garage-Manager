import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiChevronDown, FiCheckCircle, FiFlag, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import api from '../api/axios';

import carImage1 from '../assets/f1-car-1.png';
import carImage2 from '../assets/f1-car-2.png';

const REQUIRED_CATEGORIES_COUNT = 5;

function isPosInt(n) {
  return Number.isInteger(n) && n > 0;
}
function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function CarSetup({ user }) {
  const userRole = (user?.rol || '').toLowerCase();
  const hasNoTeam = !user?.id_equipo || String(user?.id_equipo) === '0';

  const canUsePage = userRole === 'admin' || userRole === 'engineer';
  const showEngineerNoTeamView = hasNoTeam && userRole === 'engineer';

  // ===== State =====
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teams
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Cars
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState(null);

  // Setup
  const [setupSummary, setSetupSummary] = useState(null);
  const [setupCategories, setSetupCategories] = useState([]);

  // UI
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [optionsByCategory, setOptionsByCategory] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // ===== API helpers =====
  async function fetchTeams() {
    const r = await api.get('/teams');
    return Array.isArray(r.data) ? r.data : [];
  }

  async function fetchCarsForTeam(id_equipo) {
    if (userRole === 'engineer') {
      const r = await api.get('/cars/my');
      return Array.isArray(r.data) ? r.data : [];
    }
    const r = await api.get(`/cars/team/${id_equipo}`);
    return Array.isArray(r.data) ? r.data : [];
  }

  async function fetchCarSetup(id_carro) {
    const r = await api.get(`/car-setup/car/${id_carro}`);
    return r.data; // { summary, categories }
  }

  async function fetchInventoryOptions(category_id) {
    const r = await api.get(`/car-setup/inventory/category/${category_id}`);
    return Array.isArray(r.data) ? r.data : [];
  }

  // ===== Carga inicial (teams + select team) =====
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError('');

        // Si no puede usar la página o engineer sin equipo: no cargar nada
        if (!canUsePage || showEngineerNoTeamView) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const list = await fetchTeams();
        if (cancelled) return;

        setTeams(list);

        let initialTeamId = null;

        if (userRole === 'engineer') {
          const myTeam = Number(user?.id_equipo);
          initialTeamId = isPosInt(myTeam) ? myTeam : null;
        } else {
          initialTeamId = list?.[0]?.id_equipo ? Number(list[0].id_equipo) : null;
        }

        setSelectedTeamId(initialTeamId);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setLoading(false);
        setError(e?.response?.data?.error || e.message || 'Error cargando equipos');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [canUsePage, showEngineerNoTeamView, userRole, user?.id_equipo]);

  // ===== Cargar carros cuando cambia equipo =====
  useEffect(() => {
    let cancelled = false;

    async function loadCars() {
      try {
        setError('');

        // condiciones de no carga
        if (!canUsePage || showEngineerNoTeamView) return;

        // reset UI dependiente
        setCars([]);
        setSelectedCarId(null);
        setSetupSummary(null);
        setSetupCategories([]);
        setExpandedCategoryId(null);
        setOptionsByCategory({});

        if (!selectedTeamId) return;

        // Engineer NO puede cambiar a otro equipo
        if (userRole === 'engineer') {
          const myTeam = Number(user?.id_equipo);
          if (!isPosInt(myTeam) || Number(selectedTeamId) !== myTeam) {
            return;
          }
        }

        const list = await fetchCarsForTeam(Number(selectedTeamId));
        if (cancelled) return;

        setCars(list);
        if (list.length > 0) setSelectedCarId(list[0].id_carro);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.error || e.message || 'Error cargando carros');
      }
    }

    loadCars();
    return () => { cancelled = true; };
  }, [canUsePage, showEngineerNoTeamView, selectedTeamId, userRole, user?.id_equipo]);

  // ===== Cargar setup cuando cambia carro =====
  useEffect(() => {
    let cancelled = false;

    async function loadSetup() {
      try {
        setError('');

        if (!canUsePage || showEngineerNoTeamView) return;

        setSetupSummary(null);
        setSetupCategories([]);
        setExpandedCategoryId(null);
        setOptionsByCategory({});

        if (!selectedCarId) return;

        const data = await fetchCarSetup(Number(selectedCarId));
        if (cancelled) return;

        setSetupSummary(data?.summary || null);
        setSetupCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.error || e.message || 'Error cargando setup');
      }
    }

    loadSetup();
    return () => { cancelled = true; };
  }, [canUsePage, showEngineerNoTeamView, selectedCarId]);

  // ===== Derivados =====
  const selectedTeam = useMemo(
    () => teams.find((t) => Number(t.id_equipo) === Number(selectedTeamId)) || null,
    [teams, selectedTeamId]
  );

  const selectedCar = useMemo(
    () => cars.find((c) => Number(c.id_carro) === Number(selectedCarId)) || null,
    [cars, selectedCarId]
  );

  const completedItems = useMemo(
    () => setupCategories.filter((c) => !!c.id_pieza).length,
    [setupCategories]
  );

  const progressPercentage = useMemo(
    () => (completedItems / REQUIRED_CATEGORIES_COUNT) * 100,
    [completedItems]
  );

  const allRequirementsMet = useMemo(
    () => completedItems === REQUIRED_CATEGORIES_COUNT,
    [completedItems]
  );

  const carImage = useMemo(() => {
    if (selectedCar?.imagen === 2) return carImage2;
    return carImage1;
  }, [selectedCar]);

  const P = safeNum(setupSummary?.P_total);
  const A = safeNum(setupSummary?.A_total);
  const M = safeNum(setupSummary?.M_total);

  // ===== Acciones =====
  async function toggleCategory(category_id) {
    setError('');
    const next = expandedCategoryId === category_id ? null : category_id;
    setExpandedCategoryId(next);

    if (next && !optionsByCategory[next]) {
      try {
        setLoadingOptions(true);
        const opts = await fetchInventoryOptions(next);
        setOptionsByCategory((prev) => ({ ...prev, [next]: opts }));
      } catch (e) {
        setError(e?.response?.data?.error || e.message || 'Error cargando inventario');
      } finally {
        setLoadingOptions(false);
      }
    }
  }

  async function handleGenerateCars() {
    try {
      setError('');
      setSaving(true);

      // Engineer -> genera para mi equipo
      if (userRole === 'engineer') {
        await api.post('/cars/my/generate', { baseName: 'Carro' });
        const list = await fetchCarsForTeam(Number(selectedTeamId));
        setCars(list);
        if (list.length > 0) setSelectedCarId(list[0].id_carro);
        return;
      }

      // Admin -> crea 2 para el team seleccionado (hasta el límite)
      if (userRole === 'admin') {
        if (!selectedTeamId) return;

        // intentamos crear 2; si ya hay 2 el SP tira error
        try { await api.post(`/cars/team/${selectedTeamId}`, { nombre: 'Carro 1' }); } catch (_) {}
        try { await api.post(`/cars/team/${selectedTeamId}`, { nombre: 'Carro 2' }); } catch (_) {}

        const list = await fetchCarsForTeam(Number(selectedTeamId));
        setCars(list);
        if (list.length > 0) setSelectedCarId(list[0].id_carro);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Error generando carros');
    } finally {
      setSaving(false);
    }
  }

  async function handleInstallPart(part_id) {
    try {
      setError('');
      if (!selectedCarId) return;
      if (!isPosInt(Number(part_id))) return;

      setSaving(true);

      await api.put(`/car-setup/car/${selectedCarId}/install`, { part_id: Number(part_id) });

      const data = await fetchCarSetup(Number(selectedCarId));
      setSetupSummary(data?.summary || null);
      setSetupCategories(Array.isArray(data?.categories) ? data.categories : []);

      if (expandedCategoryId) {
        const opts = await fetchInventoryOptions(expandedCategoryId);
        setOptionsByCategory((prev) => ({ ...prev, [expandedCategoryId]: opts }));
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Error instalando/reemplazando pieza');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizeCar() {
    try {
      setError('');
      if (!selectedCarId) return;
      if (!allRequirementsMet) return;

      setFinalizing(true);
      await api.post(`/car-setup/car/${selectedCarId}/finalize`);

      setSuccessMessage('¡Carro finalizado exitosamente!');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 2500);

      if (selectedTeamId) {
        const list = await fetchCarsForTeam(Number(selectedTeamId));
        setCars(list);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Error finalizando carro');
    } finally {
      setFinalizing(false);
    }
  }

  // ===== Vistas “tempranas” (PERO sin cortar hooks) =====
  if (!canUsePage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-slate-900/60 border border-yellow-500/20 p-10 rounded-3xl text-center backdrop-blur-2xl max-w-lg shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-3">Acceso restringido</h2>
          <p className="text-slate-400">Tu rol no tiene permiso para armar carros.</p>
        </div>
      </div>
    );
  }

  if (showEngineerNoTeamView) {
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
          <p className="text-slate-400 leading-relaxed">Actualmente no tienes un equipo asignado en el sistema.</p>

          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Estado: Esperando asignación de equipo</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-light/70 font-bold">Cargando armado...</div>
      </div>
    );
  }

// ===== UI normal =====
return (
  <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
    {error && (
      <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200">
        {error}
      </div>
    )}

    {/* Header */}
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
          Instala 1 parte por categoría (5) desde inventario y finaliza el carro.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 space-y-4">
          {/* Equipos */}
          <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-light/5">
              <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                EQUIPOS ({teams.length})
              </h2>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
              {teams.map((t) => {
                const active = Number(selectedTeamId) === Number(t.id_equipo);
                const locked = userRole === 'engineer' && Number(user?.id_equipo) !== Number(t.id_equipo);

                return (
                  <button
                    key={t.id_equipo}
                    disabled={locked}
                    onClick={() => setSelectedTeamId(t.id_equipo)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                      active
                        ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                        : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                    } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm md:text-base text-white truncate">{t.nombre}</span>
                      <FiChevronRight className={`text-primary transition-transform ${active ? 'translate-x-1' : ''}`} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-light/50">{locked ? 'Solo tu equipo' : 'Equipo'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedTeam?.nombre && (
              <div className="p-4 border-t border-light/5 text-xs text-light/60">
                Seleccionado: <span className="text-white font-bold">{selectedTeam.nombre}</span>
              </div>
            )}
          </div>

          {/* Carros */}
          <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-light/5">
              <h2 className="text-sm font-bold text-light/70 uppercase">Carros</h2>
            </div>

            <div className="p-3 space-y-2">
              {cars.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-light/50 text-xs font-bold">No hay carros disponibles</p>
                  <p className="text-light/40 text-xs mt-2">
                    Crea carros con POST /api/cars/team/:id_equipo (SP: sp_crear_carro).
                  </p>
                </div>
              ) : (
                cars.map((car) => (
                  <button
                    key={car.id_carro}
                    onClick={() => setSelectedCarId(car.id_carro)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${
                      Number(selectedCarId) === Number(car.id_carro)
                        ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                        : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{car.nombre || `Carro ${car.id_carro}`}</span>
                      {car.finalizado ? (
                        <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                          <FiCheckCircle className="text-green-400 text-sm" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                          <span className="text-xs text-yellow-400 font-bold text-center w-10">
                            {completedItems}/{REQUIRED_CATEGORIES_COUNT}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-light/60">{car.finalizado ? 'Finalizado' : 'En armado'}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Progreso */}
          <div className="bg-gradient-to-br from-accent/20 via-[#0f1419] to-transparent border border-accent/30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-light/50 uppercase font-bold">Progreso</div>
                <div className="text-2xl font-black text-white mt-1">
                  {completedItems}<span className="text-light/50 text-lg">/{REQUIRED_CATEGORIES_COUNT}</span>
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

      {/* Main */}
      <div className="lg:col-span-3 space-y-6">
        {!selectedCar && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-[#0f1419] to-transparent border border-primary/30 p-12 backdrop-blur-xl flex items-center justify-center min-h-96">
            <div className="relative z-10 text-center">
              <FiFlag className="text-primary/40 text-8xl mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black text-light/50 mb-2">Sin Auto Seleccionado</h2>
              <p className="text-light/40 text-sm md:text-base max-w-2xl">
                Selecciona un carro para comenzar a configurarlo
              </p>
            </div>
          </div>
        )}

        {selectedCar && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-[#0f1419] to-transparent border border-primary/30 p-8 backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-4 h-4 bg-gradient-to-r from-primary to-red-700 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">
                    {selectedCar.finalizado ? 'Finalizado' : 'En Configuración'}
                  </span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                  {selectedCar.nombre || `Carro ${selectedCar.id_carro}`}
                </h2>

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4 backdrop-blur text-center">
                    <div className="text-xs text-yellow-400 mb-2 uppercase font-bold">P</div>
                    <div className="text-3xl font-black text-yellow-400">{P}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-4 backdrop-blur text-center">
                    <div className="text-xs text-green-400 mb-2 uppercase font-bold">A</div>
                    <div className="text-3xl font-black text-green-400">{A}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 backdrop-blur text-center">
                    <div className="text-xs text-blue-400 mb-2 uppercase font-bold">M</div>
                    <div className="text-3xl font-black text-blue-400">{M}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -inset-10 bg-gradient-to-br from-primary/25 via-transparent to-accent/15 rounded-full blur-3xl -z-10"></div>
                  <img
                    src={carImage}
                    alt="F1 Car"
                    className="w-auto h-[260px] md:h-[380px] object-contain drop-shadow-[0_0_20px_rgba(225,6,0,0.2)]"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acordeón categorías */}
        {selectedCar && setupCategories?.length > 0 && (
          <div className="space-y-3">
            {setupCategories.map((cat) => {
              const categoryId = Number(cat.category_id);
              const selectedPartId = cat.id_pieza ? Number(cat.id_pieza) : null;
              const isExpanded = expandedCategoryId === categoryId;

              return (
                <div
                  key={categoryId}
                  className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden hover:border-primary/20 transition-all"
                >
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1f3a]/30 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider">{cat.categoria}</h3>

                      {selectedPartId && (
                        <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                          <FiCheck className="text-green-400 text-xs" />
                          <span className="text-xs text-green-400 font-bold truncate">{cat.pieza}</span>
                        </div>
                      )}
                    </div>

                    <FiChevronDown className={`transition-transform text-light/50 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-light/5 p-6 space-y-4 bg-gradient-to-b from-[#0a0e27]/50 to-transparent">
                      {selectedPartId && (
                        <div className="bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 rounded-xl p-4">
                          <div className="text-xs text-primary font-bold uppercase mb-1 flex items-center gap-2">
                            <FiCheckCircle className="text-green-400" /> Seleccionada
                          </div>
                          <h4 className="text-lg font-bold text-white">{cat.pieza}</h4>

                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-[#1a1f3a] rounded p-2 text-center">
                              <div className="text-xs text-yellow-400 font-bold">P</div>
                              <div className="text-xl font-black text-yellow-400">+{safeNum(cat.p)}</div>
                            </div>
                            <div className="bg-[#1a1f3a] rounded p-2 text-center">
                              <div className="text-xs text-green-400 font-bold">A</div>
                              <div className="text-xl font-black text-green-400">+{safeNum(cat.a)}</div>
                            </div>
                            <div className="bg-[#1a1f3a] rounded p-2 text-center">
                              <div className="text-xs text-blue-400 font-bold">M</div>
                              <div className="text-xl font-black text-blue-400">+{safeNum(cat.m)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-light/60 mb-2 font-bold">
                          Opciones disponibles (inventario){loadingOptions ? ' • cargando...' : ''}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
                          {(optionsByCategory[categoryId] || []).map((part) => (
                            <button
                              key={part.id_pieza}
                              onClick={() => handleInstallPart(part.id_pieza)}
                              disabled={saving || finalizing || !!selectedCar?.finalizado}
                              className={`text-left p-3 rounded-lg transition-all group ${
                                selectedPartId === Number(part.id_pieza)
                                  ? 'bg-primary/20 border border-primary'
                                  : 'border border-light/10 bg-[#1a1f3a]/50 hover:border-primary/40 hover:bg-[#1a1f3a]'
                              } ${saving || finalizing || selectedCar?.finalizado ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-sm font-bold text-light/80 group-hover:text-white">{part.nombre}</span>
                                <span className="text-xs text-light/50 font-bold">x{part.cantidad}</span>
                              </div>

                              <div className="flex gap-2 text-xs">
                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-bold">
                                  P:{safeNum(part.p)}
                                </span>
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded font-bold">
                                  A:{safeNum(part.a)}
                                </span>
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded font-bold">
                                  M:{safeNum(part.m)}
                                </span>
                              </div>
                            </button>
                          ))}

                          {(optionsByCategory[categoryId] || []).length === 0 && !loadingOptions && (
                            <div className="text-light/50 text-sm p-3">
                              No hay partes disponibles en inventario para esta categoría.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Acciones */}
        {selectedCar && (
          <div className="space-y-4">
            {allRequirementsMet && !selectedCar.finalizado && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 flex items-start gap-3 animate-pulse">
                <FiCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300 font-bold">¡Listo para finalizar!</p>
                  <p className="text-xs text-green-300/70 mt-1">
                    Tu carro tiene las 5 categorías instaladas. Presiona para guardarlo como finalizado.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleFinalizeCar}
              disabled={!allRequirementsMet || finalizing || saving || !!selectedCar.finalizado}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-lg ${
                allRequirementsMet && !selectedCar.finalizado
                  ? 'bg-gradient-to-r from-green-500 via-green-600 to-emerald-700 hover:from-green-600 hover:via-green-700 hover:to-emerald-800 shadow-lg shadow-green-500/50 hover:shadow-green-500/70 cursor-pointer transform hover:scale-105'
                  : 'bg-[#1a1f3a]/50 border border-light/10 cursor-not-allowed opacity-50'
              }`}
            >
              <FiCheckCircle className="text-xl" />
              {selectedCar.finalizado
                ? 'CARRO FINALIZADO'
                : allRequirementsMet
                  ? (finalizing ? 'FINALIZANDO...' : 'FINALIZAR CARRO')
                  : `COMPLETA ARMADO (${completedItems}/${REQUIRED_CATEGORIES_COUNT})`}
            </button>
          </div>
        )}

        {/* ===== NUEVO: Generar Carros (abajo del todo) ===== */}
        <div className="pt-6">
          <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="text-white font-black text-xl">Generar carros</h3>
              <div className="text-xs px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold uppercase tracking-wider">
                Máx 2 por equipo
              </div>
            </div>

            <p className="text-light/60 text-sm mb-4">
              Si tu equipo aún no tiene carros, podés generarlos automáticamente desde aquí.
            </p>

            <button
              onClick={handleGenerateCars}
              disabled={saving || finalizing || !selectedTeamId}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 text-lg ${
                saving || finalizing || !selectedTeamId
                  ? 'bg-[#1a1f3a]/50 border border-light/10 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-primary via-red-600 to-red-700 hover:opacity-95 shadow-lg shadow-red-500/30'
              }`}
            >
              {saving ? 'GENERANDO...' : 'GENERAR 2 CARROS'}
            </button>

            <div className="mt-3 text-xs text-light/40">
              Si ya existen 2 carros, el SP bloquea la creación (regla del proyecto).
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal Éxito */}
    {showSuccessModal && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/40 rounded-3xl p-8 max-w-sm w-full backdrop-blur-xl animate-bounce">
          <div className="text-center">
            <FiCheckCircle className="text-green-400 text-6xl mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-2">¡Éxito!</h3>
            <p className="text-light/70 mb-4">{successMessage}</p>
            <div className="text-sm text-green-300 font-bold">Cambios guardados</div>
          </div>
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

export default CarSetup;
