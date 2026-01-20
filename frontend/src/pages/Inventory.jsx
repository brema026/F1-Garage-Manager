import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { FiTrash2, FiChevronRight, FiX, FiAlertTriangle } from 'react-icons/fi';

export function Inventory({ user }) {
  const [items, setItems] = useState([]);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [equipos, setEquipos] = useState([]);

    // Modal eliminar inventario
  const [showInvDeleteModal, setShowInvDeleteModal] = useState(false);
  const [invDeleteMode, setInvDeleteMode] = useState('reduce'); // 'reduce' | 'delete'
  const [invDeleteQty, setInvDeleteQty] = useState(1);
  const [invDeleteLoading, setInvDeleteLoading] = useState(false);
  const [invDeleteError, setInvDeleteError] = useState('');
  const [invSelectedItem, setInvSelectedItem] = useState(null);

  const userRole = user?.rol?.toLowerCase();
  const hasNoTeam = !user?.id_equipo || String(user?.id_equipo) === '0';
  const showNoTeamScreen = hasNoTeam && userRole === 'engineer';
  

  const formatDateSafe = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CR');
  };

  const cargarEquipos = async () => {
    try {
      const res = await api.get('/teams'); // tu backend ya existe
      const data = Array.isArray(res.data) ? res.data : [];
      setEquipos(data);

      // auto-seleccionar el primero si no hay seleccionado
      if (data.length > 0) {
        setSelectedEquipo((prev) => prev ?? data[0].id_equipo);
      } else {
        setSelectedEquipo(null);
      }
    } catch (e) {
      setEquipos([]);
      setSelectedEquipo(null);
    }
  };


  const cargarInventario = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.get('/inventory/my');
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);

      setSelectedEquipo(Number(user?.id_equipo) || null);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Error cargando inventario');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  cargarEquipos();
  }, []);

  useEffect(() => {
  const run = async () => {
    if (!selectedEquipo) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.get(`/inventory/team/${selectedEquipo}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || 'Error cargando inventario');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  run();
}, [selectedEquipo]);

  useEffect(() => {
    // Si es engineer sin equipo, no hace sentido cargar inventario
    if (showNoTeamScreen) {
      setLoading(false);
      setItems([]);
      return;
    }
    cargarInventario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNoTeamScreen]);

  const hasInventory = items.length > 0;

  const totalItems = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
  }, [items]);

  const categoriesCount = useMemo(() => {
    const map = {};
    for (const it of items) {
      const cat = it?.categoria || 'Sin categoría';
      map[cat] = (map[cat] || 0) + (Number(it.cantidad) || 0);
    }
    return map;
  }, [items]);

  const equiposUI = useMemo(() => {
    return [{
      id_equipo: Number(user?.id_equipo) || 0,
      nombre: `Equipo #${Number(user?.id_equipo) || 0}`,
    }];
  }, [user?.id_equipo]);


    const canEditInventory =
    userRole === 'admin' ||
    (userRole === 'engineer' && String(selectedEquipo) === String(user?.id_equipo));

  const handleInvDeleteClick = (item) => {
    if (!canEditInventory) {
      alert('No tienes permisos para modificar este inventario.');
      return;
    }

    setInvSelectedItem(item);
    setInvDeleteMode('reduce');
    setInvDeleteQty(1);
    setInvDeleteError('');
    setShowInvDeleteModal(true);
  };

  const handleConfirmInvDelete = async () => {
    if (!invSelectedItem) return;

    const idEquipo = Number(selectedEquipo);
    const idPieza = Number(invSelectedItem.id_pieza);

    if (!idEquipo || !idPieza) {
      setInvDeleteError('No se pudo identificar el equipo o la pieza.');
      return;
    }

    setInvDeleteLoading(true);
    setInvDeleteError('');

    try {
      if (invDeleteMode === 'reduce') {
        const qty = Number(invDeleteQty);
        if (!Number.isInteger(qty) || qty <= 0) {
          setInvDeleteError('La cantidad debe ser un entero mayor a 0.');
          setInvDeleteLoading(false);
          return;
        }

        await api.put(`/inventory/team/${idEquipo}/part/${idPieza}/remove`, {
          cantidad: qty,
        });

        setShowInvDeleteModal(false);
        await cargarInventario();
        return;
      }

      // invDeleteMode === 'delete'
      await api.delete(`/inventory/team/${idEquipo}/part/${idPieza}`);

      setShowInvDeleteModal(false);
      await cargarInventario();
    } catch (err) {
      setInvDeleteError(err?.response?.data?.error || 'Error modificando inventario');
    } finally {
      setInvDeleteLoading(false);
    }
  };


  // ✅ Ahora el return condicional va DESPUÉS de los hooks
  if (showNoTeamScreen) {
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
            INVENTARIO
          </h1>
          <p className="text-light/50 text-sm md:text-base">Visualizar el inventario de partes por equipo</p>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-4 mb-6">
          {errorMsg}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
          {/* Selector de Equipo */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">

              {/* Lista de equipos (placeholder/mi equipo) */}
              <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-light/5">
                  <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                    EQUIPOS ({equiposUI.length})
                  </h2>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                  {equipos.length === 0 ? (
                    <div className="p-4 text-sm text-light/50">
                      No hay equipos disponibles.
                    </div>
                  ) : (
                    equipos.map((equipo) => {
                      const isSelected = selectedEquipo === equipo.id_equipo;

                      return (
                        <button
                          key={equipo.id_equipo}
                          type="button"
                          onClick={() => setSelectedEquipo(equipo.id_equipo)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                            isSelected
                              ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                              : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm md:text-base text-white truncate">
                              {equipo.nombre}
                            </span>

                            <FiChevronRight
                              className={`text-primary transition-transform ${
                                isSelected ? 'translate-x-1' : ''
                              }`}
                            />
                          </div>

                          {/* Subtexto */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-light/50">
                              ID: {equipo.id_equipo}
                            </span>

                            {isSelected ? (
                              <span className="text-accent font-bold">
                                Seleccionado
                              </span>
                            ) : (
                              <span className="text-light/40">
                                Ver inventario
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {hasInventory ? (
              <div className="space-y-6">
                {/* Header del Equipo */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#0f1419] to-transparent border border-primary/20 p-8">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0"></div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest">EQUIPO SELECCIONADO</span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                      {selectedEquipo ? `Equipo #${selectedEquipo}` : 'Equipo'}
                    </h2>

                    {/* Grid de stats */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Partes Totales</div>
                        <div className="text-2xl md:text-3xl font-black text-accent">{totalItems}</div>
                      </div>

                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Categorías</div>
                        <div className="text-2xl md:text-3xl font-black text-blue-400">{Object.keys(categoriesCount).length}</div>
                      </div>

                      <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                        <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Items Registrados</div>
                        <div className="text-2xl md:text-3xl font-black text-green-400">{items.length}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de Inventario */}
                <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="border-b border-light/5 px-6 py-4">
                    <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      Inventario Actual
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-light/10">
                          <th className="text-left py-3 px-6 text-light/50 font-bold uppercase">Parte</th>
                          <th className="text-left py-3 px-6 text-light/50 font-bold uppercase">Categoría</th>
                          <th className="text-left py-3 px-6 text-light/50 font-bold uppercase">Cantidad</th>
                          <th className="text-left py-3 px-6 text-light/50 font-bold uppercase">Fecha de Adquisición</th>
                          <th className="text-center py-3 px-6 text-light/50 font-bold uppercase">Acciones</th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id_pieza}
                            className="border-b border-light/5 hover:bg-[#1a1f3a]/40 transition-all"
                          >
                            <td className="py-4 px-6 text-white font-bold">{item.parte}</td>
                            <td className="py-4 px-6 text-light/80">{item.categoria}</td>
                            <td className="py-4 px-6">
                              <span className="inline-block bg-accent/20 border border-accent/40 text-accent font-bold py-1 px-3 rounded-lg text-sm">
                                {item.cantidad}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-light/60">{formatDateSafe(item.fecha_adquisicion)}</td>
                            <td className="py-4 px-6 text-center">
                              {/* Solo visualización por ahora */}
                              <button
                                type="button"
                                onClick={() => handleInvDeleteClick(item)}
                                className={`text-red-400 hover:text-red-300 transition-colors ${
                                  canEditInventory ? '' : 'opacity-40 cursor-not-allowed'
                                }`}
                                title={canEditInventory ? 'Eliminar / Reducir' : 'Sin permisos'}
                                disabled={!canEditInventory}
                              >
                                <FiTrash2 size={18} />
                            </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total en tabla */}
                  <div className="border-t border-light/10 bg-[#1a1f3a]/40 px-6 py-4 flex justify-end">
                    <div className="text-right">
                      <div className="text-xs text-light/50 mb-1 uppercase font-bold">Total de Partes</div>
                      <div className="text-2xl font-black text-accent">{totalItems}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center max-w-md">
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent border border-primary/40 rounded-2xl flex items-center justify-center">
                        <svg className="w-12 h-12 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                    Sin Inventario Registrado
                  </h2>
                  <p className="text-light/50 mb-8 text-sm md:text-base">
                    Este equipo no tiene partes en el inventario.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

            {/* Modal Eliminar Inventario */}
      {showInvDeleteModal && invSelectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="text-xs font-bold text-red-300 uppercase tracking-widest">
                    Inventario
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {invSelectedItem.parte}
                </h3>
                <p className="text-light/60 text-sm">{invSelectedItem.categoria}</p>
              </div>

              <button
                onClick={() => !invDeleteLoading && setShowInvDeleteModal(false)}
                className="text-light/50 hover:text-white transition-colors"
                disabled={invDeleteLoading}
                title="Cerrar"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Selector de modo */}
            <div className="bg-[#1a1f3a]/40 border border-light/10 rounded-2xl p-4 mb-4 space-y-3">
              <div className="text-xs font-bold text-light/70 uppercase tracking-wider">
                Acción
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-light/10 bg-[#0f1419]/40 hover:bg-[#0f1419]/60 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="invDeleteMode"
                  value="reduce"
                  checked={invDeleteMode === 'reduce'}
                  onChange={() => setInvDeleteMode('reduce')}
                  disabled={invDeleteLoading}
                />
                <div className="flex-1">
                  <div className="text-white font-bold">Reducir cantidad</div>
                  <div className="text-xs text-light/50">Resta unidades del inventario</div>
                </div>
                <div className="text-xs font-bold text-blue-300">
                  Actual: {invSelectedItem.cantidad}
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="invDeleteMode"
                  value="delete"
                  checked={invDeleteMode === 'delete'}
                  onChange={() => setInvDeleteMode('delete')}
                  disabled={invDeleteLoading}
                />
                <div className="flex-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <FiAlertTriangle className="text-red-300" />
                    Eliminar del inventario
                  </div>
                  <div className="text-xs text-red-200/70">
                    Borra el registro del inventario para este equipo
                  </div>
                </div>
              </label>
            </div>

            {/* Cantidad si reduce */}
            {invDeleteMode === 'reduce' && (
              <div className="bg-[#1a1f3a]/40 border border-light/10 rounded-2xl p-4 mb-4">
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-3">
                  Cantidad a eliminar
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setInvDeleteQty((q) => Math.max(1, Number(q) - 1))}
                    className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-300 font-black transition-all disabled:opacity-50"
                    disabled={invDeleteLoading}
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={invDeleteQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') return setInvDeleteQty('');
                      const n = Number(v);
                      setInvDeleteQty(Number.isNaN(n) ? 1 : Math.max(1, Math.floor(n)));
                    }}
                    className="flex-1 px-4 py-3 bg-[#0f1419]/60 border border-light/10 rounded-xl text-white focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all font-bold"
                    disabled={invDeleteLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setInvDeleteQty((q) => Math.max(1, Number(q) + 1))}
                    className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-300 font-black transition-all disabled:opacity-50"
                    disabled={invDeleteLoading}
                  >
                    +
                  </button>
                </div>

                <div className="mt-3 text-xs text-light/60">
                  Equipo: <span className="text-white font-bold">#{selectedEquipo}</span> · Pieza:{' '}
                  <span className="text-white font-bold">#{invSelectedItem.id_pieza}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {invDeleteError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm font-bold">
                {invDeleteError}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowInvDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all disabled:opacity-50"
                disabled={invDeleteLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmInvDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold hover:from-red-500 hover:to-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={invDeleteLoading}
              >
                {invDeleteLoading
                  ? 'Procesando...'
                  : invDeleteMode === 'reduce'
                    ? 'Reducir'
                    : 'Eliminar'}
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

export default Inventory;
