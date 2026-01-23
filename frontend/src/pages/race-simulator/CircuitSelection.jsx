import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit2, FiCheck, FiMapPin, FiHash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Videos de fondo
import onboard01 from "../../assets/circuits/backgroundVideos/onboard-01.mp4";
import onboard02 from "../../assets/circuits/backgroundVideos/onboard-02.mp4";

export default function CircuitSelection({ onSelect }) {
  const [createdCircuits, setCreatedCircuits] = useState([]);
  const [circuitName, setCircuitName] = useState("");
  const [distance, setDistance] = useState("");
  const [curves, setCurves] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [randomVideo, setRandomVideo] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Seleccionar video aleatorio
  useEffect(() => {
    const videos = [onboard01, onboard02];
    const chosenVideo = videos[Math.floor(Math.random() * videos.length)];
    setRandomVideo(chosenVideo);
  }, []);

  // Validar formulario
  useEffect(() => {
    const isValid = 
      circuitName.trim().length > 0 && 
      distance.trim().length > 0 && 
      curves.trim().length > 0 &&
      parseFloat(distance) > 0 &&
      parseInt(curves) > 0;
    
    setIsFormValid(isValid);
  }, [circuitName, distance, curves]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!circuitName.trim() || !distance || !curves) {
      alert("Por favor, completa todos los campos");
      return;
    }

    const distanceNum = parseFloat(distance);
    const curvesNum = parseInt(curves);

    if (isNaN(distanceNum) || distanceNum <= 0) {
      alert("La distancia debe ser un número positivo");
      return;
    }

    if (isNaN(curvesNum) || curvesNum <= 0) {
      alert("El número de curvas debe ser un número positivo");
      return;
    }

    if (editingId) {
      setCreatedCircuits(prev => prev.map(circuit => {
        if (circuit.id === editingId) {
          return {
            ...circuit,
            name: circuitName.trim(),
            distance: distanceNum,
            curves: curvesNum,
          };
        }
        return circuit;
      }));
      setEditingId(null);
    } else {
      const newCircuit = {
        id: Date.now(),
        name: circuitName.trim(),
        distance: distanceNum,
        curves: curvesNum,
      };

      setCreatedCircuits(prev => [newCircuit, ...prev]);
    }

    // Limpiar formulario
    setCircuitName("");
    setDistance("");
    setCurves("");
  };

  const handleEdit = (circuit) => {
    setCircuitName(circuit.name);
    setDistance(circuit.distance);
    setCurves(circuit.curves.toString());
    setEditingId(circuit.id);
  };

  const handleDelete = (id) => {
    setCreatedCircuits(prev => prev.filter(circuit => circuit.id !== id));
  };

  const handleUseCircuit = (circuit) => {
    if (onSelect) {
      onSelect(circuit);
    }
  };

  const cancelEdit = () => {
    setCircuitName("");
    setDistance("");
    setCurves("");
    setEditingId(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 font-sans">
      
      {/* Video de fondo */}
      {randomVideo && (
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.05 }}
          animate={{ 
            scale: [1.05, 1.08, 1.05],
            x: [0, -15, 0],
            y: [0, -8, 0],
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <motion.video
            key={randomVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={randomVideo} type="video/mp4" />
          </motion.video>
        </motion.div>
      )}

      {/* Overlay para escritorio */}
      <div className="absolute inset-0 z-[1] hidden lg:block" 
        style={{
          background: `linear-gradient(to right, 
            rgba(10,10,10,0.45) 0%, 
            rgba(10,10,10,0.45) 35%, 
            rgba(10,10,10,0.60) 50%, 
            rgba(10,10,10,0.95) 100%)`
        }} 
      />

      {/* Overlay para móvil */}
      <div className="absolute inset-0 z-[1] lg:hidden" 
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0,0,0,0.80) 0%, 
            rgba(0,0,0,0.70) 30%, 
            rgba(0,0,0,0.60) 50%, 
            rgba(0,0,0,0.40) 70%, 
            rgba(0,0,0,0.20) 100%)`
        }} 
      />

      {/* Línea divisoria */}
      <div className="absolute top-[10%] bottom-[10%] left-[44%] w-px z-[2] hidden lg:block">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row pt-3 lg:pt-0">
        
        {/* Panel izquierdo - Formulario */}
        <motion.div 
          className="w-full lg:w-[44%] min-h-[50vh] lg:min-h-screen flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 order-1 lg:order-1"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          
          {/* Botón volver móvil */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/")}
            className="lg:hidden flex items-center gap-3 group p-3 mb-3"
          >
            <FiArrowLeft className="text-xl text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400 group-hover:text-red-500">
              Volver
            </span>
          </motion.button>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="mb-8 lg:mb-12 flex flex-col items-center lg:items-start"
          > 
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-4xl font-black uppercase tracking-tight text-white mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  CREADOR DE
                </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 ml-3">
                  CIRCUITOS
                </span>
              </h1>
              <div className="w-24 h-[2px] bg-gradient-to-r from-red-500/40 via-red-500 to-red-500/40 rounded-full mx-auto lg:mx-0 my-2" />
              <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
                CREA TUS PROPIOS CIRCUITOS
              </p>
            </div>
          </motion.div>

          {/* Contenido del formulario */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="relative"
            >
              <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/[0.1] p-6 lg:p-8 shadow-2xl shadow-black/50">
                
                {/* Cabecera */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-4 mb-8 pb-6 border-b border-white/[0.05]"
                >
                  <div className={`p-3 rounded-xl ${editingId ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30' : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30'}`}>
                    {editingId ? (
                      <FiEdit2 className="text-2xl text-yellow-500" />
                    ) : (
                      <FiPlus className="text-2xl text-red-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-wide">
                      {editingId ? "Editar Circuito" : "Nuevo Circuito"}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1 tracking-wide">
                      {editingId ? "Modifica los datos" : "Define características"}
                    </p>
                  </div>
                </motion.div>

                {/* Campos del formulario */}
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Nombre */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <label className="block text-xs font-medium uppercase tracking-[0.25em] text-gray-300 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                      Nombre del Circuito
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={circuitName}
                        onChange={(e) => setCircuitName(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-sm backdrop-blur-sm group-hover:border-white/[0.15]"
                        placeholder="Ej: Circuito de Alta Velocidad"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors duration-300">
                        🏁
                      </div>
                    </div>
                  </motion.div>

                  {/* Distancia y curvas */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Distancia */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.25em] text-gray-300 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                        Distancia (km)
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          step="0.001"
                          min="0.1"
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none backdrop-blur-sm group-hover:border-white/[0.15]"
                          placeholder="5.793"
                          required
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors duration-300">
                          <FiMapPin className="text-sm" />
                        </span>
                      </div>
                    </div>

                    {/* Curvas */}
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-[0.25em] text-gray-300 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
                        Número de Curvas
                      </label>
                      <div className="relative group">
                        <input
                          type="number"
                          min="1"
                          value={curves}
                          onChange={(e) => setCurves(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all duration-300 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none backdrop-blur-sm group-hover:border-white/[0.15]"
                          placeholder="15"
                          required
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-red-500 transition-colors duration-300">
                          <FiHash className="text-sm" />
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Botones */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="flex gap-4 pt-8 border-t border-white/[0.05]"
                  >
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden ${
                        !isFormValid
                          ? 'cursor-not-allowed bg-white/[0.03] border border-white/[0.08] text-white/20'
                          : editingId 
                            ? 'bg-gradient-to-r from-yellow-600/90 to-yellow-700/90 hover:from-yellow-700 hover:to-yellow-800 text-white'
                            : 'bg-gradient-to-r from-red-600/90 to-red-700/90 hover:from-red-700 hover:to-red-800 text-white'
                      }`}
                      whileHover={isFormValid ? { scale: 1.02 } : {}}
                      whileTap={isFormValid ? { scale: 0.98 } : {}}
                    >
                      {/* Efecto hover */}
                      {isFormValid && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      )}
                      
                      <FiCheck className={`text-xl transition-all duration-300 relative z-10 ${
                        isFormValid 
                          ? 'group-hover:scale-110 opacity-100' 
                          : 'opacity-20'
                      }`} />
                      <span className={`relative z-10 transition-all duration-300 ${
                        isFormValid ? '' : 'opacity-40'
                      }`}>
                        {editingId ? "Actualizar" : "Crear Circuito"}
                      </span>
                    </button>
                    
                    {editingId && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-6 py-4 border border-white/[0.1] text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03] rounded-xl transition-all duration-300 uppercase tracking-wider text-sm font-medium backdrop-blur-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancelar
                      </button>
                    )}
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Panel derecho - Lista */}
        <motion.div
          className="flex-1 w-full lg:w-auto min-h-[50vh] lg:min-h-screen p-6 sm:p-8 md:p-10 lg:p-12 order-1 lg:order-1 flex flex-col"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          
          {/* Botón volver escritorio */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate("/")}
            className="absolute top-6 right-6 z-50 hidden lg:flex items-center gap-3 group p-3"
          >
            <FiArrowLeft className="text-xl text-gray-400 group-hover:text-red-500 transition-colors duration-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400 group-hover:text-red-500">
              Volver
            </span>
          </motion.button>
          
          {/* Header lista */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 lg:mb-10 gap-4 lg:gap-0 pt-0 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full sm:w-auto"
            >
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-white/95 tracking-[0.15em] uppercase">
                  Circuitos Creados
                </h2>
                <div className="h-px flex-1 sm:flex-none sm:w-8 lg:w-12 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <p className="text-[11px] text-white/50 tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500/60" />
                {createdCircuits.length} {createdCircuits.length === 1 ? 'circuito' : 'circuitos'} disponibles
              </p>
            </motion.div>
          </div>

          {/* Contenedor con scroll */}
          <div className="relative flex-1 min-h-[400px] rounded-xl border border-white/[0.08] overflow-hidden bg-white/[0.02] backdrop-blur-sm">
            {/* Gradientes superior/inferior */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />
            
            {/* Contenido scrollable */}
            <div 
              className="h-full max-h-[calc(100vh-250px)] overflow-y-auto px-2 custom-circuit-scroll"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 3%, black 97%, transparent 100%)",
              }}
            >
              {createdCircuits.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]"
                >
                  <div className="text-7xl mb-6 opacity-10">🏁</div>
                  <h3 className="text-xl font-bold text-gray-300 mb-3">
                    Sin circuitos creados
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto text-sm">
                    Crea tu primer circuito usando el formulario
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-4 p-4">
                  <AnimatePresence mode="popLayout">
                    {createdCircuits.map((circuit, index) => (
                      <CircuitCard
                        key={circuit.id}
                        circuit={circuit}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onUse={handleUseCircuit}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Estilos del scrollbar */}
      <style>{`
        .custom-circuit-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-circuit-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          margin: 6px 0;
        }
        .custom-circuit-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #7f1d1d);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .custom-circuit-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ef4444, #991b1b);
        }
      `}</style>
    </div>
  );
}

// Componente CircuitCard
function CircuitCard({ circuit, index, onEdit, onDelete, onUse }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group relative cursor-pointer"
    >
      <motion.div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 bg-black/30 ring-1 ring-white/[0.08] backdrop-blur-sm group hover:ring-red-500/30"
        whileHover={{ borderColor: "rgba(220, 38, 38, 0.3)" }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-6 bg-gradient-to-b from-red-500 to-red-700 rounded-full"></div>
                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-red-400 transition-colors duration-300 truncate">
                  {circuit.name}
                </h3>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex gap-2">
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(circuit);
                }}
                className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-gray-400 hover:text-yellow-500 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Editar circuito"
              >
                <FiEdit2 className="text-sm" />
              </motion.button>
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(circuit.id);
                }}
                className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-gray-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Eliminar circuito"
              >
                <FiTrash2 className="text-sm" />
              </motion.button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <FiMapPin className="text-gray-400 text-sm" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  Distancia
                </span>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-light text-white">
                  {circuit.distance}
                </span>
                <span className="text-sm text-gray-400 ml-2">km</span>
              </div>
            </div>
            
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
              <div className="flex items-center gap-2 mb-2">
                <FiHash className="text-gray-400 text-sm" />
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  Curvas
                </span>
              </div>
              <span className="text-2xl font-light text-white">
                {circuit.curves}
              </span>
            </div>
          </div>

          {/* Botón usar */}
          <motion.button
            onClick={() => onUse(circuit)}
            className="w-full py-3.5 border border-white/[0.1] text-gray-300 hover:text-white hover:border-red-500/50 hover:bg-red-500/5 rounded-xl transition-all duration-300 text-sm font-medium uppercase tracking-wider group/btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-3">
              <span>Usar este circuito</span>
              <FiArrowLeft className="rotate-180 text-red-500 opacity-0 group-hover/btn:opacity-100 transition-all duration-300 transform group-hover/btn:translate-x-1" />
            </span>
          </motion.button>
        </div>

        {/* Línea inferior */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/60 via-red-500/40 to-red-500/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}