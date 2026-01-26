import { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import { FiPlus, FiEdit, FiX, FiChevronRight, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { CATEGORIAS } from '../utils/constants';

export function Parts({ user }) {
  const [partes, setPartes] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);

  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit (edit = add stock)
  const [categorias, setCategorias] = useState([]);

  // ====== Equipos (para Admin comprar a un equipo seleccionado) ======
  const [equipos, setEquipos] = useState([]);
  const [buyTeamId, setBuyTeamId] = useState(''); // string/number en select

  // Modal compra
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyQty, setBuyQty] = useState(1);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal eliminar (Admin)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState('reduce'); // 'reduce' | 'delete'
  const [deleteQty, setDeleteQty] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: '', // number
    potencia: 0,
    aerodinamica: 0,
    manejabilidad: 0,
    precio: 0,
    stock: 0,
  });

  const userRole = user?.rol?.toLowerCase();
  const hasNoTeam = !user?.id_equipo || String(user?.id_equipo) === '0';

  const hasParts = partes.length > 0;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const res = await api.get('/categories');
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log('ERROR CARGANDO CATEGORIAS:', err?.response?.status, err?.response?.data);
        setCategorias([]);
      }
    };

    loadCategorias();
  }, []);

  // ====== cargar equipos (solo si es admin; se usa en modal de compra) ======
  useEffect(() => {
    const loadEquipos = async () => {
      try {
        if (userRole !== 'admin') return;

        const res = await api.get('/teams');
        const data = Array.isArray(res.data) ? res.data : [];
        setEquipos(data);

        // set default team si no hay seleccionado aún
        if (data.length > 0) {
          setBuyTeamId((prev) => (prev ? prev : String(data[0].id_equipo)));
        } else {
          setBuyTeamId('');
        }
      } catch (err) {
        console.log('ERROR CARGANDO EQUIPOS:', err?.response?.status, err?.response?.data);
        setEquipos([]);
        setBuyTeamId('');
      }
    };

    loadEquipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  /* =============================
     CARGAR PARTES DESDE BACKEND
     ============================= */
  useEffect(() => {
    cargarPartes();
  }, []);

  const cargarPartes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parts');
      const data = Array.isArray(res.data) ? res.data : [];
      setPartes(data);
      if (data.length > 0) setSelectedPart(data[0]);
      else setSelectedPart(null);
    } catch (error) {
      console.error('Error cargando partes', error);
      setPartes([]);
      setSelectedPart(null);
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     FILTRO
     ============================= */
  const partesFiltradas = useMemo(() => {
    return partes.filter((p) => {
      const catOK =
        filtroCategoria === 'Todas' ||
        String(p.categoria).toLowerCase() === String(filtroCategoria).toLowerCase();

      const nameOK = String(p.nombre || '').toLowerCase().includes(busqueda.toLowerCase());

      return catOK && nameOK;
    });
  }, [partes, filtroCategoria, busqueda]);

  /* =============================
     MODAL
     ============================= */
  const handleCreatePart = () => {
    setModalMode('create');
    setFormData({
      nombre: '',
      categoria_id: '',
      potencia: 0,
      aerodinamica: 0,
      manejabilidad: 0,
      precio: 0,
      stock: 0,
    });
    setShowModal(true);
  };

  const handleEditPart = () => {
    if (!selectedPart) return;

    setModalMode('edit'); // "Agregar stock"
    setFormData({
      nombre: selectedPart.nombre,
      categoria_id: selectedPart.categoria_id ?? '',
      potencia: selectedPart.p ?? 0,
      aerodinamica: selectedPart.a ?? 0,
      manejabilidad: selectedPart.m ?? 0,
      precio: selectedPart.precio ?? 0,
      stock: 0, // cantidad a agregar
    });
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  /* =============================
     SUBMIT (CREATE / ADD STOCK)
     ============================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        const payload = {
          nombre: formData.nombre,
          precio: Number(formData.precio),
          p: Number(formData.potencia),
          a: Number(formData.aerodinamica),
          m: Number(formData.manejabilidad),
          categoria_id: Number(formData.categoria_id),
          stock_inicial: Number(formData.stock),
        };

        await api.post('/parts', payload);
      } else {
        if (!selectedPart?.id_pieza) {
          alert('No hay pieza seleccionada');
          return;
        }

        await api.put(`/parts/${selectedPart.id_pieza}/stock`, {
          cantidad: Number(formData.stock),
        });
      }

      handleCloseModal();
      await cargarPartes();
    } catch (error) {
      alert(error.response?.data?.error || 'Error en la operación');
    }
  };

  /* =============================
     BLOQUEO ENGINEER SIN EQUIPO
     ============================= */
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

  // Show loading spinner while verifying session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    const n = Number(price || 0);
    return `$${n.toLocaleString('en-US')}`;
  };

  //Compras
  const handleBuyClick = () => {
    if (!selectedPart) return;

    const idPieza = selectedPart?.id_pieza ?? selectedPart?.id_parte;
    if (!idPieza) return alert('No se encontró el id de la pieza');

    // Engineer: exige equipo asignado
    if (userRole === 'engineer' && (!user?.id_equipo || String(user.id_equipo) === '0')) {
      return alert('No tienes equipo asignado');
    }

    // Admin: exige seleccionar equipo (cargado desde /teams)
    if (userRole === 'admin') {
      if (!equipos.length) return alert('No hay equipos disponibles para comprar');
      if (!buyTeamId) return alert('Selecciona un equipo para comprar');
    }

    setBuyQty(1);
    setBuyError('');
    setShowBuyModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedPart) return;

    const idPieza = selectedPart?.id_pieza ?? selectedPart?.id_parte;
    if (!idPieza) return setBuyError('No se encontró el id de la pieza');

    const qty = Number(buyQty);
    if (!Number.isInteger(qty) || qty <= 0) return setBuyError('La cantidad debe ser un entero mayor a 0.');

    // Determinar id_equipo según rol
    const teamId =
      userRole === 'admin'
        ? Number(buyTeamId)
        : Number(user?.id_equipo);

    if (!teamId || teamId === 0) {
      return setBuyError('Selecciona un equipo válido para comprar.');
    }

    setBuyLoading(true);
    setBuyError('');

    try {
      await api.post('/parts/buy', {
        id_equipo: teamId,
        id_pieza: Number(idPieza),
        cantidad: qty,
      });

      setShowBuyModal(false);
      alert('Compra realizada');
      await cargarPartes();
    } catch (error) {
      setBuyError(error.response?.data?.error || 'Error en la compra');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedPart) return;

    if (userRole !== 'admin') {
      alert('Solo Admin puede eliminar o reducir stock.');
      return;
    }

    setDeleteMode('reduce');
    setDeleteQty(1);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPart) return;

    const idPieza = selectedPart?.id_pieza ?? selectedPart?.id_parte;
    if (!idPieza) return setDeleteError('No se encontró el id de la pieza');

    setDeleteLoading(true);
    setDeleteError('');

    try {
      if (deleteMode === 'reduce') {
        const qty = Number(deleteQty);
        if (!Number.isInteger(qty) || qty <= 0) {
          setDeleteError('La cantidad debe ser un entero mayor a 0.');
          setDeleteLoading(false);
          return;
        }

        await api.put(`/parts/${idPieza}/reduce-stock`, { cantidad: qty });

        setShowDeleteModal(false);
        alert('Stock reducido correctamente');
        await cargarPartes();
        return;
      }

      // deleteMode === 'delete'
      await api.delete(`/parts/${idPieza}`);

      setShowDeleteModal(false);
      alert('Pieza eliminada correctamente');
      await cargarPartes();
    } catch (error) {
      setDeleteError(error.response?.data?.error || 'Error en la operación');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            TIENDA DE PARTES
          </h1>
          <p className="text-light/50 text-sm md:text-base">
            Gestionar partes y componentes para los carros F1
          </p>
        </div>
      </div>

      {/* Estado Vacío */}
      {!hasParts ? (
        <div className="flex items-center justify-center min-h-[60vh]">
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
              Sin Partes Registradas
            </h2>
            <p className="text-light/50 mb-8 text-sm md:text-base">
              Comienza a registrar partes para equipar tus carros F1.
            </p>

            <button
              onClick={handleCreatePart}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <FiPlus className="text-xl" />
              REGISTRAR PARTE
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-4">
                {userRole !== 'engineer' && (
                  <button
                    onClick={handleCreatePart}
                    className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                  >
                    <FiPlus className="text-lg" />
                    NUEVA PARTE
                  </button>
                )}

                {/* Filtros */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden p-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Categoría
                    </label>
                    <select
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                    >
                      {CATEGORIAS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Buscar
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre de parte..."
                      className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all text-sm"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>

                {/* Lista */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">
                      PARTES ({partesFiltradas.length})
                    </h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {partesFiltradas.map((parte) => (
                      <button
                        key={parte.id_pieza}
                        onClick={() => setSelectedPart(parte)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                          selectedPart?.id_pieza === parte.id_pieza
                            ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                            : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm md:text-base text-white truncate">{parte.nombre}</span>
                          <FiChevronRight
                            className={`text-primary transition-transform ${
                              selectedPart?.id_pieza === parte.id_pieza ? 'translate-x-1' : ''
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-light/50">{parte.categoria}</span>
                          <div className="text-accent font-bold">${(Number(parte.precio) / 1000).toFixed(0)}k</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-[#0f1419] to-transparent border border-primary/20 p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-0"></div>

                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">PARTE ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                        {selectedPart?.nombre}
                      </h2>
                      <p className="text-light/60 text-sm">{selectedPart?.categoria}</p>
                    </div>
                    {userRole !== 'engineer' && (
                      <button
                        onClick={handleEditPart}
                        className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                      >
                        <FiEdit />
                        AGREGAR STOCK
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Precio</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">
                        ${(Number(selectedPart?.precio || 0) / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Stock</div>
                      <div className="text-2xl md:text-3xl font-black text-blue-400">
                        {selectedPart?.stock ?? 0}
                      </div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Estado</div>
                      <div className={`text-sm font-black uppercase ${(selectedPart?.stock ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(selectedPart?.stock ?? 0) > 0 ? 'Disponible' : 'Agotado'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
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
                    <div className="text-white font-bold">{selectedPart?.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Categoría</div>
                    <div className="text-white font-bold">{selectedPart?.categoria}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Precio Unitario</div>
                    <div className="text-white font-bold">{formatPrice(selectedPart?.precio || 0)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">ID Pieza</div>
                    <div className="text-white font-bold">#{selectedPart?.id_pieza}</div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button
                  onClick={handleBuyClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
                >
                  <FiPlus />
                  COMPRAR
                </button>

                {userRole !== 'engineer' && (
                  <button
                    onClick={handleDeleteClick}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 transition-all"
                  >
                    <FiTrash2 />
                    ELIMINAR
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white">
                {modalMode === 'create' ? 'NUEVA PARTE' : 'AGREGAR STOCK'}
              </h3>
              <button onClick={handleCloseModal} className="text-light/50 hover:text-white transition-colors">
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre solo en create */}
              {modalMode === 'create' && (
                <div>
                  <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                    Nombre de la Parte
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="Ej: Motor Mejorado"
                    required
                  />
                </div>
              )}

              {/* Categoria solo en create */}
              {modalMode === 'create' && (
                <div>
                  <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                    Categoría
                  </label>

                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((c) => (
                      <option key={c.category_id} value={c.category_id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sliders solo en create */}
              {modalMode === 'create' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Potencia (+{formData.potencia})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="9"
                      value={formData.potencia}
                      onChange={(e) => setFormData({ ...formData, potencia: Number(e.target.value) })}
                      className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Aerodinámica (+{formData.aerodinamica})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="9"
                      value={formData.aerodinamica}
                      onChange={(e) => setFormData({ ...formData, aerodinamica: Number(e.target.value) })}
                      className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Manejabilidad (+{formData.manejabilidad})
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="9"
                      value={formData.manejabilidad}
                      onChange={(e) => setFormData({ ...formData, manejabilidad: Number(e.target.value) })}
                      className="w-full h-2 bg-[#1a1f3a] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                      Precio (USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      required
                    />
                  </div>
                </>
              )}

              {/* Stock: en create es stock inicial, en edit es cantidad a agregar */}
              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  {modalMode === 'create' ? 'Stock Inicial' : 'Cantidad a agregar'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
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

      {/* Modal Comprar */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Comprar</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {selectedPart?.nombre}
                </h3>
                <p className="text-light/60 text-sm">{selectedPart?.categoria}</p>
              </div>

              <button
                onClick={() => !buyLoading && setShowBuyModal(false)}
                className="text-light/50 hover:text-white transition-colors"
                disabled={buyLoading}
                title="Cerrar"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Admin: selector de equipo */}
            {userRole === 'admin' && (
              <div className="bg-[#1a1f3a]/40 border border-light/10 rounded-2xl p-4 mb-4">
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-3">
                  Comprar para el equipo
                </label>

                <select
                  value={buyTeamId}
                  onChange={(e) => setBuyTeamId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0f1419]/60 border border-light/10 rounded-xl text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-bold"
                  disabled={buyLoading}
                >
                  {equipos.length === 0 ? (
                    <option value="">No hay equipos</option>
                  ) : (
                    equipos.map((eq) => (
                      <option key={eq.id_equipo} value={String(eq.id_equipo)}>
                        {eq.nombre} (ID: {eq.id_equipo})
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-3">
                <div className="text-[10px] text-light/50 mb-1 uppercase font-bold tracking-wider">Precio</div>
                <div className="text-white font-black">
                  ${(Number(selectedPart?.precio || 0) / 1000).toFixed(0)}k
                </div>
              </div>

              <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-3">
                <div className="text-[10px] text-light/50 mb-1 uppercase font-bold tracking-wider">Stock</div>
                <div className="text-white font-black">
                  {selectedPart?.stock ?? 0}
                </div>
              </div>

              <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-3">
                <div className="text-[10px] text-light/50 mb-1 uppercase font-bold tracking-wider">Total</div>
                <div className="text-accent font-black">
                  {formatPrice((Number(selectedPart?.precio || 0) * Number(buyQty || 0)))}
                </div>
              </div>
            </div>

            {/* Cantidad */}
            <div className="bg-[#1a1f3a]/40 border border-light/10 rounded-2xl p-4 mb-4">
              <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-3">
                Cantidad a comprar
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBuyQty((q) => Math.max(1, Number(q) - 1))}
                  className="w-11 h-11 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-black transition-all disabled:opacity-50"
                  disabled={buyLoading}
                  title="Disminuir"
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  value={buyQty}
                  onChange={(e) => setBuyQty(() => {
                    const v = e.target.value;
                    if (v === '') return '';
                    const n = Number(v);
                    return Number.isNaN(n) ? 1 : Math.max(1, Math.floor(n));
                  })}
                  className="flex-1 px-4 py-3 bg-[#0f1419]/60 border border-light/10 rounded-xl text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-bold"
                  placeholder="1"
                  disabled={buyLoading}
                />

                <button
                  type="button"
                  onClick={() => setBuyQty((q) => Math.max(1, Number(q) + 1))}
                  className="w-11 h-11 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-black transition-all disabled:opacity-50"
                  disabled={buyLoading}
                  title="Aumentar"
                >
                  +
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-light/60">
                  ID pieza: <span className="text-white font-bold">#{selectedPart?.id_pieza}</span>
                </span>
                <span className={`font-bold ${(selectedPart?.stock ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(selectedPart?.stock ?? 0) > 0 ? 'Disponible' : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Error */}
            {buyError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm font-bold">
                {buyError}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBuyModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all disabled:opacity-50"
                disabled={buyLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmBuy}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-red-700 text-white font-bold hover:from-red-600 hover:to-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={buyLoading}
              >
                {buyLoading ? 'Comprando...' : 'Confirmar compra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar / Reducir stock */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full overflow-hidden">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span className="text-xs font-bold text-red-300 uppercase tracking-widest">Eliminar</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {selectedPart?.nombre}
                </h3>
                <p className="text-light/60 text-sm">{selectedPart?.categoria}</p>
              </div>

              <button
                onClick={() => !deleteLoading && setShowDeleteModal(false)}
                className="text-light/50 hover:text-white transition-colors"
                disabled={deleteLoading}
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
                  name="deleteMode"
                  value="reduce"
                  checked={deleteMode === 'reduce'}
                  onChange={() => setDeleteMode('reduce')}
                  disabled={deleteLoading}
                />
                <div className="flex-1">
                  <div className="text-white font-bold">Reducir stock</div>
                  <div className="text-xs text-light/50">Resta unidades del stock en tienda</div>
                </div>
                <div className="text-xs font-bold text-blue-300">
                  Stock: {selectedPart?.stock ?? 0}
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer">
                <input
                  type="radio"
                  name="deleteMode"
                  value="delete"
                  checked={deleteMode === 'delete'}
                  onChange={() => setDeleteMode('delete')}
                  disabled={deleteLoading}
                />
                <div className="flex-1">
                  <div className="text-white font-bold flex items-center gap-2">
                    <FiAlertTriangle className="text-red-300" />
                    Eliminar pieza completa
                  </div>
                  <div className="text-xs text-red-200/70">
                    Solo si stock = 0 y no tiene referencias (compras, inventario, setup)
                  </div>
                </div>
              </label>
            </div>

            {/* Cantidad (solo si reduce) */}
            {deleteMode === 'reduce' && (
              <div className="bg-[#1a1f3a]/40 border border-light/10 rounded-2xl p-4 mb-4">
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-3">
                  Cantidad a eliminar del stock
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteQty((q) => Math.max(1, Number(q) - 1))}
                    className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-300 font-black transition-all disabled:opacity-50"
                    disabled={deleteLoading}
                    title="Disminuir"
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={deleteQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') return setDeleteQty('');
                      const n = Number(v);
                      setDeleteQty(Number.isNaN(n) ? 1 : Math.max(1, Math.floor(n)));
                    }}
                    className="flex-1 px-4 py-3 bg-[#0f1419]/60 border border-light/10 rounded-xl text-white placeholder-light/30 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all font-bold"
                    placeholder="1"
                    disabled={deleteLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setDeleteQty((q) => Math.max(1, Number(q) + 1))}
                    className="w-11 h-11 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/30 text-red-300 font-black transition-all disabled:opacity-50"
                    disabled={deleteLoading}
                    title="Aumentar"
                  >
                    +
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-light/60">
                    ID pieza: <span className="text-white font-bold">#{selectedPart?.id_pieza}</span>
                  </span>
                  <span className={`font-bold ${(selectedPart?.stock ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(selectedPart?.stock ?? 0) > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>
            )}

            {/* Warning extra si delete */}
            {deleteMode === 'delete' && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-3 text-sm font-bold">
                Esto borrará la pieza permanentemente (si el SP lo permite). Asegúrate de que el stock sea 0.
              </div>
            )}

            {/* Error */}
            {deleteError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm font-bold">
                {deleteError}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-light/10 text-white font-bold hover:bg-[#1a1f3a] transition-all disabled:opacity-50"
                disabled={deleteLoading}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-800 text-white font-bold hover:from-red-500 hover:to-red-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? 'Procesando...'
                  : deleteMode === 'reduce'
                    ? 'Reducir stock'
                    : 'Eliminar pieza'}
              </button>
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

export default Parts;

