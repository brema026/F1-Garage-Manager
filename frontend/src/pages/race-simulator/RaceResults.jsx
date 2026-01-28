import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  FiFlag, 
  FiChevronLeft,
  FiChevronDown,
  FiBarChart2
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { raceResultsData } from "../../data/RaceResultsData";
import { formatTime, formatDiff } from "../../utils/helpers"

// Imagen de fondo
import resultsBg from "../../assets/circuits/results.jpg";

export default function RaceResults({ onBack, circuit, cars, simulationData }) {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleResults, setVisibleResults] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  const results = simulationData?.results || raceResultsData.results;
  const circuitName = circuit?.name || raceResultsData.circuitName;

  // Cargar resultados con animación
  useEffect(() => {
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Mostrar resultados uno por uno
      results.forEach((result, index) => {
        setTimeout(() => {
          setVisibleResults(prev => [...prev, result]);
        }, index * 60);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [results]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Función para manejar clic en botón Grafana
  const handleGrafanaClick = (result) => {
    console.log(`Abriendo Grafana para: ${result.driver} - ${result.car}`);
    // Por ahora no hace nada, solo log
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
        <div className="w-full max-w-7xl mx-auto">

          {/* TARJETA DE CIRCUITO CON BOTÓN VOLVER */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-5"
          >
            <div className="bg-black/15 backdrop-blur-sm rounded-lg border border-white/[0.05] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gradient-to-br from-red-900/15 to-red-800/8 border border-red-700/20">
                    <FiFlag className="text-sm text-red-400/70" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-0.5">RESULTADOS DE SIMULACIÓN</p>
                    <p className="text-sm font-medium text-white">{circuitName}</p>
                  </div>
                </div>
                
                {/* BOTÓN VOLVER */}
                <motion.button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 group px-3 py-1.5 bg-white/[0.02] border border-white/[0.06] rounded-md hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 mr-1"
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiChevronLeft className="text-gray-400 group-hover:text-red-400 transition-colors duration-200 text-xs " />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-300 group-hover:text-white transition-colors duration-200">
                    Volver al inicio
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* SECCIÓN DE RESULTADOS */}
          <div className="relative h-[calc(100vh-280px)] min-h-[500px] max-h-[700px] rounded-lg border border-white/[0.04] overflow-hidden bg-black/10 backdrop-blur-sm">
            {/* GRADIENTES */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-neutral-950/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-neutral-950/70 to-transparent z-10 pointer-events-none" />
            
            {/* CONTENEDOR CON CABECERA FIJA */}
            <div className="h-full flex flex-col">
              {/* CABECERA DE COLUMNAS FIJA */}
              <div className="hidden lg:block bg-black/30 backdrop-blur-md border-b border-white/[0.03] px-3 py-3 sticky top-0 z-20">
                <div className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">POS</span>
                  </div>
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">PILOTO</span>
                  </div>
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">EQUIPO</span>
                  </div>
                  
                  {/* ATRIBUTOS */}
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">POT</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">AERO</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">MAN</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">HAB</span>
                  </div>
                  
                  {/* TIEMPO */}
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">TIEMPO</span>
                  </div>
                  
                  {/* DIFERENCIA */}
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">DIF</span>
                  </div>
                  
                  {/* DETALLES */}
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">DET</span>
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
                      <p className="text-gray-400 uppercase tracking-widest text-xs">Calculando resultados...</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {/* LISTA DE RESULTADOS */}
                    <div className="space-y-1.5 px-1">
                      <AnimatePresence>
                        {visibleResults.map((result, index) => (
                          <motion.div
                            key={result.id}
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
                              <ResultRowDesktop 
                                result={result} 
                                isExpanded={expandedRow === result.id}
                                onToggleExpand={() => toggleRowExpand(result.id)}
                                onGrafanaClick={() => handleGrafanaClick(result)}
                              />
                            </div>
                            
                            {/* MÓVIL */}
                            <div className="lg:hidden">
                              <ResultRowMobile 
                                result={result} 
                                isExpanded={expandedRow === result.id}
                                onToggleExpand={() => toggleRowExpand(result.id)}
                                onGrafanaClick={() => handleGrafanaClick(result)}
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
          className="mt-4 pt-3 border-t border-white/[0.03] w-full max-w-7xl"
        >
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/80">
              Simulación completada • {new Date().toLocaleDateString()}
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
function ResultRowDesktop({ result, isExpanded, onToggleExpand, onGrafanaClick }) {
  return (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.001 }}
    >
      {/* FILA PRINCIPAL */}
      <div 
        onClick={() => onToggleExpand()}
        className="grid grid-cols-12 gap-1 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-black/35 backdrop-blur-md"
        style={{ height: '48px' }}
      >
        {/* POSICIÓN */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border cursor-pointer border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {result.position}
          </div>
        </div>

        {/* PILOTO */}
        <div className="col-span-2 flex items-center">
          <div className="flex items-center gap-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold text-white/90 truncate">
                {result.driver}
              </h3>
              <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] truncate">#{result.carNumber}</p>
            </div>
          </div>
        </div>

        {/* EQUIPO */}
        <div className="col-span-2 flex items-center justify-start">
          <div>
            <p className="text-[13px] text-gray-300 font-medium truncate">{result.team}</p>
          </div>
        </div>

        {/* ATRIBUTOS */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {result.P}
          </div>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {result.A}
          </div>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {result.M}
          </div>
        </div>
        
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {result.H}
          </div>
        </div>

        {/* TIEMPO */}
        <div className="col-span-1 flex items-center justify-center">
          <div className="space-y-0.5 w-full text-center">
            <div className="text-[13px] font-mono font-medium truncate text-white/80">
              {formatTime(result.timeSeconds)}
            </div>
          </div>
        </div>

        {/* DIFERENCIA */}
        <div className="col-span-1 flex items-center justify-center">
          <div className={`text-[13px] px-2 py-1 rounded-full border inline-block backdrop-blur-md ${
            result.diff === 0 
              ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30' 
              : 'bg-black/30 text-gray-400 border-white/[0.05]'
          }`}>
            {formatDiff(result.diff)}
          </div>
        </div>

        {/* ÍCONO EXPANDIR */}
        <div className="col-span-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="p-1 rounded border border-white/[0.06] hover:border-white/[0.12] hover:bg-black/30 transition-all duration-150 backdrop-blur-md"
          >
            <FiChevronDown className="text-white/40 text-[13px]" />
          </motion.div>
        </div>
      </div>

      {/* PANEL EXPANDIDO - SETUP DEL CARRO */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-black/30 backdrop-blur-md rounded-lg border border-white/[0.05]">
              {/* PRIMERA SECCIÓN: ESTADÍSTICAS DE VELOCIDAD */}
              <div className="p-4 border-b border-white/[0.04]">
                <div className="grid grid-cols-4 gap-4">
                  {/* VELOCIDAD RECTA */}
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2">VEL. RECTA</p>
                    <div className="text-base font-light text-white">
                      {result.Vrecta}
                      <span className="text-xs text-gray-400 ml-1">km/h</span>
                    </div>
                  </div>
                  
                  {/* VELOCIDAD CURVA */}
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2">VEL. CURVA</p>
                    <div className="text-base font-light text-white">
                      {result.Vcurva}
                      <span className="text-xs text-gray-400 ml-1">km/h</span>
                    </div>
                  </div>
                  
                  {/* PENALIZACIÓN */}
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2">PENALIZACIÓN</p>
                    <div className="text-base font-light text-white">
                      {result.penalty > 0 ? 
                        <span className="text-red-300">{result.penalty}s</span> : 
                        <span className="text-gray-400">—</span>
                      }
                    </div>
                  </div>
                  
                  {/* TIEMPO NETO */}
                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2">TIEMPO NETO</p>
                    <div className="text-base font-light text-white font-mono">
                      {(result.timeSeconds - result.penalty).toFixed(3)}
                      <span className="text-xs text-gray-400 ml-0.5">s</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* SEGUNDA SECCIÓN: BOTÓN VER GRAFANA */}
              <div className="p-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => window.open('http://localhost:3003/d/adv5dh8', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 backdrop-blur-md bg-gradient-to-r from-orange-900/20 to-yellow-800/10 text-orange-300 border-orange-800/30 hover:bg-orange-900/30 hover:border-orange-700/50 hover:text-orange-200"
                  >
                    <FiBarChart2 className="text-sm" />
                    <span className="text-[13px] font-medium uppercase tracking-[0.15em]">
                      VER GRAFANA
                    </span>
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em]">
                  Análisis detallado de telemetría
                </p>
              </div>
              
              {/* TERCERA SECCIÓN: SETUP DEL CARRO */}
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-3">SETUP DEL CARRO |
                  <span className="text-white/90 font-medium ml-1.5">{result.car || "N/A"}</span>
                </p>
                <div className="grid grid-cols-5 gap-3">
                  {/* UNIDAD DE POTENCIA */}
                  <div className="bg-black/25 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">UNIDAD DE POTENCIA</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{result.carSetup?.powerUnit?.name || "N/A"}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.powerUnit?.p || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">P</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.powerUnit?.a || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">A</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.powerUnit?.m || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">M</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* PAQUETE AERODINÁMICO */}
                  <div className="bg-black/25 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">PAQUETE AERODINÁMICO</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{result.carSetup?.aeroPackage?.name || "N/A"}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.aeroPackage?.p || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">P</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.aeroPackage?.a || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">A</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.aeroPackage?.m || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">M</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* NEUMÁTICOS */}
                  <div className="bg-black/25 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">NEUMÁTICOS</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{result.carSetup?.tires?.name || "N/A"}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.tires?.p || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">P</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.tires?.a || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">A</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.tires?.m || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">M</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* SUSPENSIÓN */}
                  <div className="bg-black/25 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">SUSPENSIÓN</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{result.carSetup?.suspension?.name || "N/A"}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.suspension?.p || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">P</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.suspension?.a || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">A</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.suspension?.m || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">M</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CAJA DE CAMBIOS */}
                  <div className="bg-black/25 rounded-lg p-3 border border-white/[0.04]">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1.5">CAJA DE CAMBIOS</p>
                    <p className="text-sm font-medium text-white mb-2 truncate">{result.carSetup?.gearbox?.name || "N/A"}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.gearbox?.p || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">P</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.gearbox?.a || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">A</p>
                      </div>
                      <div className="text-center">
                        <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-xs font-bold text-white/90">
                          {result.carSetup?.gearbox?.m || 0}
                        </div>
                        <p className="text-[8px] uppercase tracking-[0.15em] text-gray-400 mt-1">M</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// FILA DE MÓVIL - MÁS OSCURA
function ResultRowMobile({ result, isExpanded, onToggleExpand, onGrafanaClick }) {
  return (
    <motion.div
      className="group relative"
      whileHover={{ scale: 1.002 }}
    >
      <div 
        onClick={() => onToggleExpand()}
        className="p-2.5 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-black/35 backdrop-blur-md"
      >
        {/* HEADER MÓVIL */}
        <div className="flex items-center justify-between mb-3">
          {/* POSICIÓN Y PILOTO - MÁS OSCURO */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border cursor-pointer border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {result.position}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white/90">{result.driver}</h3>
              <p className="text-[9px] text-gray-400">#{result.carNumber} • {result.team}</p>
            </div>
          </div>

          {/* TIEMPO Y DIFERENCIA */}
          <div className="text-right">
            <div className="text-xs font-mono text-white/80">
              {formatTime(result.timeSeconds)}
            </div>
            <div className={`text-[10px] px-2 py-0.5 rounded-full border mt-0.5 backdrop-blur-md ${
              result.diff === 0 
                ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30' 
                : 'bg-black/30 text-gray-400 border-white/[0.05]'
            }`}>
              {formatDiff(result.diff)}
            </div>
          </div>
        </div>

        {/* ATRIBUTOS MÓVIL - MÁS OSCUROS */}
        <div className="flex justify-between mb-2 px-1">
          {/* POT */}
          <div className="text-center">
            <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mx-auto mb-1 border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {result.P}
            </div>
            <div className="text-[7px] uppercase tracking-[0.2em] text-gray-400">POT</div>
          </div>
          
          {/* AERO */}
          <div className="text-center">
            <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mx-auto mb-1 border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {result.A}
            </div>
            <div className="text-[7px] uppercase tracking-[0.2em] text-gray-400">AERO</div>
          </div>
          
          {/* MAN */}
          <div className="text-center">
            <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mx-auto mb-1 border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {result.M}
            </div>
            <div className="text-[7px] uppercase tracking-[0.2em] text-gray-400">MAN</div>
          </div>
          
          {/* HAB */}
          <div className="text-center">
            <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mx-auto mb-1 border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {result.H}
            </div>
            <div className="text-[7px] uppercase tracking-[0.2em] text-gray-400">HAB</div>
          </div>
        </div>

        {/* ÍCONO EXPANDIR */}
        <div className="flex justify-center mt-1">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="p-1 rounded border border-white/[0.06] hover:border-white/[0.12] hover:bg-black/30 transition-all duration-150 backdrop-blur-md flex items-center gap-1"
          >
            <FiChevronDown className="text-white/40 text-[10px]" />
          </motion.div>
        </div>

        {/* PANEL EXPANDIDO MÓVIL - SETUP DEL CARRO */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/[0.04] mt-3">
                {/* ESTADÍSTICAS */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-black/25 rounded p-2 border border-white/[0.04] backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 block mb-1">V. RECTA</span>
                    <div className="text-sm font-light text-white">
                      {result.Vrecta} km/h
                    </div>
                  </div>
                  <div className="bg-black/25 rounded p-2 border border-white/[0.04] backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 block mb-1">V. CURVA</span>
                    <div className="text-sm font-light text-white">
                      {result.Vcurva} km/h
                    </div>
                  </div>
                  <div className="bg-black/25 rounded p-2 border border-white/[0.04] backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 block mb-1">PENALIZACIÓN</span>
                    <div className="text-sm font-light text-white">
                      {result.penalty > 0 ? 
                        <span className="text-red-300">{result.penalty}s</span> : 
                        <span className="text-gray-400">—</span>
                      }
                    </div>
                  </div>
                  <div className="bg-black/25 rounded p-2 border border-white/[0.04] backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 block mb-1">TIEMPO NETO</span>
                    <div className="text-sm font-light text-white font-mono">
                      {(result.timeSeconds - result.penalty).toFixed(3)} s
                    </div>
                  </div>
                </div>
                
                {/* BOTÓN VER GRAFANA MÓVIL */}
                <div className="mb-4">
                  <div className="flex items-center justify-center">
                    <motion.button
                      onClick={onGrafanaClick}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 backdrop-blur-md bg-gradient-to-r from-blue-900/20 to-blue-800/10 text-blue-300 border-blue-800/30 hover:bg-blue-900/30 hover:border-blue-700/50 hover:text-blue-200 w-full max-w-xs"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiBarChart2 className="text-sm" />
                      <span className="text-[12px] font-medium uppercase tracking-[0.15em]">
                        VER GRAFANA
                      </span>
                    </motion.button>
                  </div>
                  <p className="text-center text-[9px] text-gray-400 mt-1 uppercase tracking-[0.15em]">
                    Telemetría detallada
                  </p>
                </div>
                
                {/* SETUP DEL CARRO */}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-2">SETUP DEL CARRO |
                    <span className="text-white/90 font-medium ml-1.5">{result.car || "N/A"}</span>
                  </p>
                  <div className="space-y-3">
                    {/* UNIDAD DE POTENCIA */}
                    <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1">UNIDAD DE POTENCIA</p>
                      <p className="text-xs font-medium text-white mb-1.5 truncate">{result.carSetup?.powerUnit?.name || "N/A"}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.powerUnit?.p || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">P</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.powerUnit?.a || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">A</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.powerUnit?.m || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">M</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* PAQUETE AERODINÁMICO */}
                    <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1">PAQUETE AERODINÁMICO</p>
                      <p className="text-xs font-medium text-white mb-1.5 truncate">{result.carSetup?.aeroPackage?.name || "N/A"}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.aeroPackage?.p || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">P</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.aeroPackage?.a || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">A</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.aeroPackage?.m || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">M</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* NEUMÁTICOS */}
                    <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1">NEUMÁTICOS</p>
                      <p className="text-xs font-medium text-white mb-1.5 truncate">{result.carSetup?.tires?.name || "N/A"}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.tires?.p || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">P</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.tires?.a || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">A</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.tires?.m || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">M</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* SUSPENSIÓN */}
                    <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1">SUSPENSIÓN</p>
                      <p className="text-xs font-medium text-white mb-1.5 truncate">{result.carSetup?.suspension?.name || "N/A"}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.suspension?.p || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">P</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.suspension?.a || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">A</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.suspension?.m || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">M</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* CAJA DE CAMBIOS */}
                    <div className="bg-black/25 rounded p-2.5 border border-white/[0.04] backdrop-blur-md">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-1">CAJA DE CAMBIOS</p>
                      <p className="text-xs font-medium text-white mb-1.5 truncate">{result.carSetup?.gearbox?.name || "N/A"}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.gearbox?.p || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">P</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.gearbox?.a || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">A</p>
                        </div>
                        <div className="text-center">
                          <div className="w-5 h-5 rounded-full border border-white/[0.1] bg-black/40 flex items-center justify-center text-[10px] font-bold text-white/90 mx-auto">
                            {result.carSetup?.gearbox?.m || 0}
                          </div>
                          <p className="text-[7px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">M</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}