import { useState } from 'react';
import { CATEGORIAS, INVENTORY, EQUIPOS, formatDate, getTotalItems, getCategoriesCount } from '../data/InventoryData';
import { FiPlus, FiX, FiTrash2, FiChevronRight } from 'react-icons/fi';

export function Inventory() {
  const [selectedEquipo, setSelectedEquipo] = useState(INVENTORY && INVENTORY.length > 0 ? INVENTORY[0].id_equipo : 1);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id_parte: '', nombre_parte: '', categoria: '', cantidad: 0, fecha: new Date().toISOString().split('T')[0] });

  const selectedInventory = INVENTORY.find(inv => inv.id_equipo === selectedEquipo);
  const hasInventory = selectedInventory && selectedInventory.items.length > 0;
  const categoriesCount = hasInventory ? getCategoriesCount(selectedInventory.items) : {};
  const totalItems = hasInventory ? getTotalItems(selectedInventory.items) : 0;

  const handleAddItem = () => {
    setShowModal(true);
    setFormData({
      id_parte: '',
      nombre_parte: '',
      categoria: '',
      cantidad: 0,
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      id_parte: '',
      nombre_parte: '',
      categoria: '',
      cantidad: 0,
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Agregar item al inventario:', selectedEquipo, formData);
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1419] to-[#050812] p-4 md:p-8">
      {/* Header */}
      <div className="mb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent blur-3xl rounded-full"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
            INVENTARIO
          </h1>
          <p className="text-light/50 text-sm md:text-base">Gestionar el inventario de partes por equipo</p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 xl:gap-8">
        
        {/* Selector de Equipo */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {/* Botón crear */}
            <button
              onClick={handleAddItem}
              className="w-full bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 md:text-sm"
            >
              <FiPlus className="text-lg" />
              AGREGAR PARTE
            </button>

            {/* Lista de equipos */}
            <div className="bg-[#0f1419]/80 border border-light/5 backdrop-blur rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-light/5">
                <h2 className="text-sm font-bold text-light/70 uppercase tracking-wider">EQUIPOS ({EQUIPOS.length})</h2>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto px-3 py-3 custom-scrollbar">
                {EQUIPOS.map((equipo) => {
                  const equipoInventory = INVENTORY.find(inv => inv.id_equipo === equipo.id_equipo);
                  const totalItems = equipoInventory ? getTotalItems(equipoInventory.items) : 0;
                  
                  return (
                    <button
                      key={equipo.id_equipo}
                      onClick={() => setSelectedEquipo(equipo.id_equipo)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 group ${
                        selectedEquipo === equipo.id_equipo
                          ? 'bg-primary/20 border border-primary shadow-lg shadow-primary/20'
                          : 'bg-[#1a1f3a]/50 border border-light/5 hover:bg-[#1a1f3a] hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm md:text-base text-white truncate">{equipo.nombre}</span>
                        <FiChevronRight className={`text-primary transition-transform ${selectedEquipo === equipo.id_equipo ? 'translate-x-1' : ''}`} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-light/50">{equipoInventory ? equipoInventory.items.length : 0} items</span>
                        <span className="text-accent font-bold">{totalItems} piezas</span>
                      </div>
                    </button>
                  );
                })}
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
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{selectedInventory.equipo_nombre}</h2>
                  
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
                      <div className="text-2xl md:text-3xl font-black text-green-400">{selectedInventory.items.length}</div>
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
                      {selectedInventory.items.map((item) => (
                        <tr key={item.id_item} className="border-b border-light/5 hover:bg-[#1a1f3a]/40 transition-all">
                          <td className="py-4 px-6 text-white font-bold">{item.nombre_parte}</td>
                          <td className="py-4 px-6 text-light/80">{item.categoria}</td>
                          <td className="py-4 px-6">
                            <span className="inline-block bg-accent/20 border border-accent/40 text-accent font-bold py-1 px-3 rounded-lg text-sm">
                              {item.cantidad}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-light/60">{formatDate(item.fecha_adquisicion)}</td>
                          <td className="py-4 px-6 text-center">
                            <button className="text-red-400 hover:text-red-300 transition-colors">
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