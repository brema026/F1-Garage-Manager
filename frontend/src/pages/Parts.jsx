import { useState, useMemo } from 'react';
import { PARTS, CATEGORIAS } from '../data/PartsData';
import { FiEdit, FiPlus, FiX, FiChevronRight, FiTrash2 } from 'react-icons/fi';

export function Parts() {
  const [selectedPart, setSelectedPart] = useState(PARTS && PARTS.length > 0 ? PARTS[0] : null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({ nombre: '', categoria: '', potencia: 0, aerodinamica: 0, manejabilidad: 0, precio: 0, stock: 0 });

  const hasParts = PARTS && PARTS.length > 0;

  // Filtrar partes según categoría y búsqueda
  const partesFiltradas = useMemo(() => {
    return PARTS.filter((parte) => {
      const coincideCategoria =
        filtroCategoria === 'Todas' || parte.categoria === filtroCategoria;
      const coincideBusqueda = parte.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [filtroCategoria, busqueda]);

  const handleCreatePart = () => {
    setModalMode('create');
    setFormData({ nombre: '', categoria: '', potencia: 0, aerodinamica: 0, manejabilidad: 0, precio: 0, stock: 0 });
    setShowModal(true);
  };

  const handleEditPart = () => {
    setModalMode('edit');
    setFormData({
      nombre: selectedPart.nombre,
      categoria: selectedPart.categoria,
      potencia: selectedPart.rendimiento.potencia,
      aerodinamica: selectedPart.rendimiento.aerodinamica,
      manejabilidad: selectedPart.rendimiento.manejabilidad,
      precio: selectedPart.precio,
      stock: selectedPart.stock,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', categoria: '', potencia: 0, aerodinamica: 0, manejabilidad: 0, precio: 0, stock: 0 });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(modalMode === 'create' ? 'Crear parte:' : 'Editar parte:', formData);
    handleCloseModal();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
          <p className="text-light/50 text-sm md:text-base">Gestionar partes y componentes para los carros F1</p>
        </div>
      </div>

      {/* Estado Vacío */}
      {!hasParts ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            {/* Icono */}
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

            {/* Título */}
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
              Sin Partes Registradas
            </h2>
            <p className="text-light/50 mb-8 text-sm md:text-base">
              Comienza a registrar partes para equipar tus carros F1. Motores, aerodinámica, suspensión y más.
            </p>

            {/* Botón crear */}
            <button
              onClick={handleCreatePart}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 text-base md:text-lg"
            >
              <FiPlus className="text-xl" />
              REGISTRAR PARTE
            </button>

            {/* Características */}
            <div className="mt-8 pt-8 border-t border-light/10">
              <p className="text-xs text-light/40 mb-4">CARACTERÍSTICAS</p>
              <div className="space-y-2 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Registra partes de diferentes categorías</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Define mejoras de rendimiento</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Visualiza stock disponible</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span className="text-light/60 text-sm">Filtra y busca partes fácilmente</span>
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
                  onClick={handleCreatePart}
                  className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
                >
                  <FiPlus className="text-lg" />
                  NUEVA PARTE
                </button>

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

                {/* Lista de partes */}
                <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-light/5">
                    <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">PARTES ({partesFiltradas.length})</h2>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                    {partesFiltradas.length > 0 ? (
                      partesFiltradas.map((parte) => (
                        <button
                          key={parte.id_parte}
                          onClick={() => setSelectedPart(parte)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                            selectedPart.id_parte === parte.id_parte
                              ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                              : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm md:text-base text-white truncate">{parte.nombre}</span>
                            <FiChevronRight className={`text-primary transition-transform ${selectedPart.id_parte === parte.id_parte ? 'translate-x-1' : ''}`} />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-light/50">{parte.categoria}</span>
                            <div className="text-accent font-bold">${(parte.precio / 1000).toFixed(0)}k</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-light/50">
                        <p className="text-sm">No se encontraron partes</p>
                      </div>
                    )}
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
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">PARTE ACTUAL</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{selectedPart.nombre}</h2>
                      <p className="text-light/60 text-sm">{selectedPart.categoria}</p>
                    </div>
                    <button
                      onClick={handleEditPart}
                      className="flex items-center gap-2 bg-primary/20 hover:bg-primary/40 border border-primary/40 text-primary px-4 py-2 rounded-lg transition-all font-bold text-sm md:text-base"
                    >
                      <FiEdit />
                      EDITAR
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Precio</div>
                      <div className="text-2xl md:text-3xl font-black text-accent">${(selectedPart.precio / 1000).toFixed(0)}k</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Stock</div>
                      <div className="text-2xl md:text-3xl font-black text-blue-400">{selectedPart.stock}</div>
                    </div>
                    <div className="bg-[#1a1f3a]/50 border border-light/10 rounded-xl p-4 backdrop-blur">
                      <div className="text-xs text-light/50 mb-2 uppercase font-bold tracking-wider">Estado</div>
                      <div className={`text-sm font-black uppercase ${selectedPart.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedPart.stock > 0 ? 'Disponible' : 'Agotado'}
                      </div>
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
                    <div className="text-white font-bold">{selectedPart.nombre}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Categoría</div>
                    <div className="text-white font-bold">{selectedPart.categoria}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">Precio Unitario</div>
                    <div className="text-white font-bold">{formatPrice(selectedPart.precio)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-light/50 mb-2 uppercase font-bold">ID Parte</div>
                    <div className="text-white font-bold">#{selectedPart.id_parte}</div>
                  </div>
                </div>
              </div>

              {/* Rendimiento */}
              <div className="bg-[#0f1419]/50 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
                <div className="border-b border-light/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-light/70 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    Mejoras de Rendimiento
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {/* Grid de mejoras */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
                      <div className="text-xs text-yellow-400 uppercase font-bold mb-2">Potencia</div>
                      <div className="text-2xl font-black text-yellow-400">+{selectedPart.rendimiento.potencia}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                      <div className="text-xs text-green-400 uppercase font-bold mb-2">Aerodinámica</div>
                      <div className="text-2xl font-black text-green-400">+{selectedPart.rendimiento.aerodinamica}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                      <div className="text-xs text-blue-400 uppercase font-bold mb-2">Manejabilidad</div>
                      <div className="text-2xl font-black text-blue-400">+{selectedPart.rendimiento.manejabilidad}</div>
                    </div>
                  </div>

                  {/* Barras de progreso */}
                  <div className="pt-4 border-t border-light/10 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-light/70 uppercase">Potencia</span>
                        <span className="text-sm font-bold text-yellow-400">{selectedPart.rendimiento.potencia}</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
                          style={{ width: `${(selectedPart.rendimiento.potencia / 9) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-light/70 uppercase">Aerodinámica</span>
                        <span className="text-sm font-bold text-green-400">{selectedPart.rendimiento.aerodinamica}</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${(selectedPart.rendimiento.aerodinamica / 9) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-light/70 uppercase">Manejabilidad</span>
                        <span className="text-sm font-bold text-blue-400">{selectedPart.rendimiento.manejabilidad}</span>
                      </div>
                      <div className="w-full h-2 bg-[#1a1f3a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${(selectedPart.rendimiento.manejabilidad / 9) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50">
                  <FiPlus />
                  COMPRAR
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1419] border border-light/10 rounded-2xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white">
                {modalMode === 'create' ? 'NUEVA PARTE' : 'EDITAR PARTE'}
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

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.filter(cat => cat !== 'Todas').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Potencia (+{formData.potencia})
                </label>
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={formData.potencia}
                  onChange={(e) => setFormData({ ...formData, potencia: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, aerodinamica: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, manejabilidad: parseInt(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: 300000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-light/70 uppercase tracking-wider mb-2">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#1a1f3a]/50 border border-light/10 rounded-lg text-white placeholder-light/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  placeholder="Ej: 20"
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

export default Parts;