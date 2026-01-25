import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FiFlag, 
  FiChevronLeft,
  FiCalendar,
  FiClock,
  FiUsers,
  FiAward,
  FiChevronRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { simulationsHistoryData } from "../../data/SimulationsHistoryData";

// Imagen de fondo
import resultsBg from "../../assets/circuits/results.jpg";

export default function SimulationsHistory( { onBack, onSimulationClick } ) {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSimulations, setVisibleSimulations] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const navigate = useNavigate();

  // Cargar simulaciones con animación
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mostrar simulaciones una por una
      simulationsHistoryData.forEach((simulation, index) => {
        setTimeout(() => {
          setVisibleSimulations(prev => [...prev, simulation]);
        }, index * 40);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    onBack();
  };

  const handleSimulationClick = (simulation) => {
    onSimulationClick(simulation);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 font-sans">
      
      {/* FONDO CON IMAGEN Y MOVIMIENTO */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.05 }}
        animate={{ 
          scale: [1.05, 1.12, 1.05],
          x: [0, -20, 0],
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundImage: `url(${resultsBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: 'brightness(0.5)'
          }}
        />
      </motion.div>

      {/* OVERLAY */}
      <div className="absolute inset-0 z-[1]" 
        style={{
          background: `linear-gradient(to bottom, 
            rgba(10,10,10,0.75) 0%,
            rgba(10,10,10,0.68) 30%, 
            rgba(10,10,10,0.62) 50%, 
            rgba(10,10,10,0.55) 70%, 
            rgba(10,10,10,0.5) 100%)`
        }} 
      />

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-5 lg:p-6">
        
        {/* CONTENEDOR PRINCIPAL */}
        <div className="w-full max-w-6xl mx-auto">

          {/* CABECERA CON TÍTULO Y BOTÓN VOLVER */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <div className="bg-black/15 backdrop-blur-sm rounded-lg border border-white/[0.05] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-red-900/15 to-red-800/8 border border-red-700/20">
                    <FiCalendar className="text-base text-red-400/70" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-1">HISTORIAL DE SIMULACIONES</p>
                    <p className="text-lg font-semibold text-white">
                      {simulationsHistoryData.length} simulaciones registradas
                    </p>
                  </div>
                </div>
                
                {/* BOTÓN VOLVER */}
                <motion.button
                  onClick={handleBack}
                  className="flex items-center gap-2 group px-4 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-md hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiChevronLeft className="text-gray-400 group-hover:text-red-400 transition-colors duration-200 text-sm" />
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors duration-200">
                    Volver
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* SECCIÓN DE SIMULACIONES */}
          <div className="relative h-[calc(100vh-280px)] min-h-[500px] max-h-[700px] rounded-lg border border-white/[0.04] overflow-hidden bg-black/10 backdrop-blur-sm">
            {/* GRADIENTES SUPERIOR/INFERIOR */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-neutral-950/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-neutral-950/70 to-transparent z-10 pointer-events-none" />
            
            {/* CONTENEDOR CON CABECERA FIJA */}
            <div className="h-full flex flex-col">
              {/* CABECERA DE COLUMNAS FIJA */}
              <div className="hidden lg:block bg-black/30 backdrop-blur-md border-b border-white/[0.03] px-4 py-3 sticky top-0 z-20">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">ID SIMULACIÓN</span>
                  </div>
                  <div className="col-span-3 flex items-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">CIRCUITO</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">FECHA</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">CANT. CARROS</span>
                  </div>
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">GANADOR</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">ACC.</span>
                  </div>
                </div>
              </div>

              {/* CONTENIDO SCROLLABLE */}
              <div 
                className="flex-1 overflow-y-auto custom-scroll-elegant px-1 backdrop-blur-sm"
              >
                {isLoading ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-10 h-10 border border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-400 uppercase tracking-widest text-xs">Cargando historial...</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* LISTA DE SIMULACIONES */}
                    <div className="space-y-2 px-1">
                      <AnimatePresence>
                        {visibleSimulations.map((simulation, index) => (
                          <motion.div
                            key={simulation.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ 
                              duration: 0.3, 
                              delay: index * 0.04,
                              ease: "easeOut"
                            }}
                          >
                            {/* ESCRITORIO */}
                            <div className="hidden lg:block">
                              <SimulationRowDesktop 
                                simulation={simulation} 
                                onClick={() => handleSimulationClick(simulation)}
                                formatDate={formatDate}
                              />
                            </div>
                            
                            {/* MÓVIL */}
                            <div className="lg:hidden">
                              <SimulationRowMobile 
                                simulation={simulation} 
                                onClick={() => handleSimulationClick(simulation)}
                                formatDate={formatDate}
                              />
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 pt-4 border-t border-white/[0.03] w-full max-w-6xl"
        >
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/80">
              Historial actualizado • {new Date().toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* ESTILOS DEL SCROLLBAR */}
      <style>{`
        .custom-scroll-elegant::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }
        .custom-scroll-elegant::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
          margin: 2px 0;
        }
        .custom-scroll-elegant::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          border: 0.5px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.05);
        }
        .custom-scroll-elegant::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
        }
        .custom-scroll-elegant::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-scroll-elegant::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// FILA DE ESCRITORIO
function SimulationRowDesktop({ simulation, onClick, formatDate }) {
  return (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.001 }}
    >
      {/* FILA PRINCIPAL */}
      <div 
        onClick={onClick}
        className="grid grid-cols-12 gap-2 px-4 py-3 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-red-500/30 hover:bg-black/40 backdrop-blur-md"
      >
        {/* ID SIMULACIÓN */}
        <div className="col-span-2 flex items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded border border-white/[0.08] bg-black/40 backdrop-blur-md">
              <FiFlag className="text-xs text-red-400/70" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white/90 truncate">
                {simulation.simulation_id}
              </h3>
            </div>
          </div>
        </div>

        {/* CIRCUITO */}
        <div className="col-span-3 flex items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/90 truncate">{simulation.circuit_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <FiClock className="text-[10px] text-gray-400" />
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.1em]">{simulation.time}</p>
            </div>
          </div>
        </div>

        {/* FECHA */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-md">
            <FiCalendar className="text-[10px] text-gray-400" />
            <span className="text-xs text-white/80">{formatDate(simulation.date)}</span>
          </div>
        </div>

        {/* CANTIDAD DE CARROS */}
        <div className="col-span-2 flex items-center justify-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-white/[0.08] bg-black/40 backdrop-blur-md">
            <FiUsers className="text-[10px] text-gray-400" />
            <span className="text-xs font-medium text-white/90">{simulation.car_count}</span>
          </div>
        </div>

        {/* GANADOR */}
        <div className="col-span-2 flex items-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 rounded border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md">
              <FiAward className="text-[10px] text-yellow-500/80" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{simulation.winner}</p>
            </div>
          </div>
        </div>

        {/* ÍCONO ACCIÓN */}
        <div className="col-span-1 flex items-center justify-center">
          <motion.div
            className="p-1.5 rounded border border-white/[0.08] hover:border-white/[0.15] hover:bg-black/40 transition-all duration-150 backdrop-blur-md group-hover:border-red-500/30 group-hover:bg-red-500/5"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronRight className="text-white/40 text-xs group-hover:text-red-400 transition-colors duration-150" />
          </motion.div>
        </div>
      </div>

      {/* LÍNEA INFERIOR DE ACENTO */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}

// FILA DE MÓVIL
function SimulationRowMobile({ simulation, onClick, formatDate }) {
  return (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.002 }}
    >
      <div 
        onClick={onClick}
        className="p-4 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-red-500/30 hover:bg-black/40 backdrop-blur-md"
      >
        {/* HEADER MÓVIL */}
        <div className="flex items-start justify-between mb-3">
          {/* ID Y CIRCUITO */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded border border-white/[0.08] bg-black/40 backdrop-blur-md">
                <FiFlag className="text-xs text-red-400/70" />
              </div>
              <h3 className="text-sm font-semibold text-white/90 truncate">
                {simulation.simulation_id}
              </h3>
            </div>
            <p className="text-xs font-medium text-white/80 truncate">{simulation.circuit_name}</p>
          </div>

          {/* ÍCONO ACCIÓN */}
          <motion.div
            className="p-1.5 rounded border border-white/[0.08] hover:border-white/[0.15] hover:bg-black/40 transition-all duration-150 backdrop-blur-md group-hover:border-red-500/30 group-hover:bg-red-500/5 ml-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronRight className="text-white/40 text-xs group-hover:text-red-400 transition-colors duration-150" />
          </motion.div>
        </div>

        {/* INFORMACIÓN DETALLADA */}
        <div className="grid grid-cols-2 gap-3">
          {/* FECHA Y HORA */}
          <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
            <div className="flex items-center gap-1.5 mb-1">
              <FiCalendar className="text-[10px] text-gray-400" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">FECHA</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90">{formatDate(simulation.date)}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <FiClock className="text-[9px] text-gray-400" />
                <span className="text-[9px] text-gray-400">{simulation.time}</span>
              </div>
            </div>
          </div>

          {/* CANTIDAD DE CARROS */}
          <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
            <div className="flex items-center gap-1.5 mb-1">
              <FiUsers className="text-[10px] text-gray-400" />
              <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">CARROS</span>
            </div>
            <div className="text-base font-light text-white/90">
              {simulation.car_count}
            </div>
          </div>

          {/* GANADOR */}
          <div className="col-span-2 bg-gradient-to-r from-black/30 to-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md">
                  <FiAward className="text-[10px] text-yellow-500/80" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-0.5">GANADOR</p>
                  <p className="text-sm font-medium text-white/90 truncate">{simulation.winner}</p>
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/60 font-medium">
                VICTORIA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LÍNEA INFERIOR DE ACENTO MÓVIL */}
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
      />
    </motion.div>
  );
}