import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { 
  FiArrowLeft, 
  FiCheck, 
  FiZap, 
  FiWind, 
  FiTarget, 
  FiUser, 
  FiFlag,
  FiChevronRight,
  FiMapPin,
  FiGlobe,
  FiHash
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// DATA
import { getCarrosFinalizados } from "../../data/CarSelectionData";

// IMÁGENES DE FONDO ALEATORIAS
import randomBackground1 from "../../assets/circuits/1.webp";
import randomBackground2 from "../../assets/circuits/2.webp";
import randomBackground3 from "../../assets/circuits/3.webp";

// Array de imágenes de fondo aleatorias
const randomBackgrounds = [
  randomBackground1,
  randomBackground2,
  randomBackground3
];

const MIN_CARS = 2;
const MAX_CARS = 26;

export default function VehicleSelection({ circuit, onBack, onStartRace }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const [randomBackground, setRandomBackground] = useState(null);
  const navigate = useNavigate();

  const carrosDisponibles = useMemo(() => getCarrosFinalizados(), []);
  
  // Usar circuito pasado como prop o el default
  const currentCircuit = circuit;
  
  // Seleccionar fondo aleatorio al cargar
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomBackgrounds.length);
    setRandomBackground(randomBackgrounds[randomIndex]);
  }, []);

  const toggleCarSelection = (carId) => {
    setSelectedCars((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      }
      if (prev.length >= MAX_CARS) return prev;
      return [...prev, carId];
    });
  };

  const selectAll = () => {
    if (selectedCars.length === carrosDisponibles.length) {
      setSelectedCars([]);
    } else {
      setSelectedCars(carrosDisponibles.map((c) => c.id_carro));
    }
  };

  const canStartRace = selectedCars.length >= MIN_CARS;

  const handleStartRace = () => {
    if (canStartRace) {
      const selectedCarsData = carrosDisponibles.filter((c) =>
        selectedCars.includes(c.id_carro)
      );
      onStartRace(selectedCarsData);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 font-sans">
      
      {/* BOTÓN VOLVER SUPERIOR - SIEMPRE VISIBLE EN MÓVIL/TABLET */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onBack}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 group p-3 lg:hidden"
      >
        <FiArrowLeft className="text-gray-400 text-xl group-hover:text-red-500 transition-colors duration-200" />
        <div className="relative">
          <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors duration-200">
            Volver
          </span>
        </div>
      </motion.button>
      
      {/* FONDO ALEATORIO */}
      {randomBackground && (
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
            className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%] hidden lg:block"
            style={{
              backgroundImage: `url(${randomBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          {/* VERSIÓN MÓVIL - MÁS OSCURA */}
          <div
            className="absolute inset-0 lg:hidden"
            style={{
              backgroundImage: `url(${randomBackground})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.3)",
            }}
          />
        </motion.div>
      )}

      {/* OVERLAY - ESCRITORIO */}
      <div className="absolute inset-0 z-[1] hidden md:block" 
        style={{
          background: `linear-gradient(to right, 
            rgba(10,10,10,0.50) 0%, 
            rgba(10,10,10,0.72) 35%, 
            rgba(10,10,10,0.92) 50%, 
            rgba(10,10,10,0.98) 100%)`
        }} 
      />

      {/* OVERLAY - MÓVIL */}
      <div className="absolute inset-0 z-[1] md:hidden" 
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0,0,0,0.85) 0%, 
            rgba(0,0,0,0.75) 30%, 
            rgba(0,0,0,0.65) 50%, 
            rgba(0,0,0,0.45) 70%, 
            rgba(0,0,0,0.25) 100%)`
        }} 
      />

      {/* OVERLAY ADICIONAL PARA CONTRASTE */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-950/60 via-transparent to-neutral-950/40" />
      
      {/* LÍNEA DIVISORA - SOLO EN ESCRITORIO */}
      <div className="absolute top-[10%] bottom-[10%] left-[44%] w-px z-[2] hidden lg:block">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row pt-16 lg:pt-0">
        
        {/* PANEL IZQUIERDO - CIRCUITO */}
        <motion.div 
          className="w-full lg:w-[44%] min-h-[50vh] lg:min-h-screen flex flex-col p-3 sm:p-4 md:p-6 lg:p-8 order-2 lg:order-1"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          
          {/* CONTENIDO CENTRAL */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* LOCATION TAG - SIMPLIFICADO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex items-center gap-3 mb-4 lg:mb-6 justify-center lg:justify-start"
            >
              <div className="w-7 h-4 lg:w-8 lg:h-5 bg-gradient-to-r from-red-500/20 to-red-700/20 rounded-sm flex items-center justify-center border border-red-500/30">
                <FiGlobe className="text-red-400/70 text-[10px]" />
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <FiMapPin className="text-[10px] lg:text-[11px]" />
                <span className="text-xs font-medium tracking-widest uppercase">
                  Custom Circuit
                </span>
              </div>
            </motion.div>

            {/* NOMBRE CIRCUITO */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase italic tracking-tight text-white leading-[0.9] mb-20 lg:mb-6 text-center lg:text-left"
            >
              {currentCircuit.name}
            </motion.h1>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex gap-6 lg:gap-12 justify-center lg:justify-start"
            >
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <FiMapPin className="text-white/40 text-sm" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80">
                    Distancia
                  </p>
                </div>
                <p className="text-3xl lg:text-4xl font-extralight text-white/90 tracking-tight">
                  {currentCircuit.distance}
                  <span className="text-sm text-white/50 ml-1 lg:ml-2 font-normal">km</span>
                </p>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <FiHash className="text-white/40 text-sm" />
                  <p className="text-[11px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80">
                    Curvas
                  </p>
                </div>
                <p className="text-3xl lg:text-4xl font-extralight text-white/90 tracking-tight">
                  {currentCircuit.curves}
                </p>
              </div>
            </motion.div>
          </div>

          {/* FOOTER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-4 lg:mt-4 pt-4 lg:pt-6 border-t border-white/[0.04]"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-0">
              {/* CONTADOR */}
              <div className="w-full lg:w-auto text-center lg:text-left">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80 mb-2">
                  Seleccionados
                </p>
                <div className="flex items-baseline justify-center lg:justify-start gap-2">
                  <motion.span 
                    className={`text-4xl lg:text-5xl font-extralight tracking-tight transition-colors duration-700 ${
                      canStartRace ? "text-emerald-400/90" : "text-white/80"
                    }`}
                    key={selectedCars.length}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {selectedCars.length}
                  </motion.span>
                  <span className="text-base lg:text-lg text-white/50 font-light">
                    / {carrosDisponibles.length}
                  </span>
                </div>
              </div>

              {/* BOTÓN INICIAR */}
              <motion.button
                onClick={handleStartRace}
                disabled={!canStartRace}
                className={`group relative overflow-hidden px-6 py-3 lg:px-8 lg:py-4 transition-all duration-700 w-full lg:w-auto ${
                  canStartRace
                    ? "cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    : "cursor-not-allowed bg-white/[0.02] text-white/15 border border-white/[0.04]"
                }`}
                whileHover={canStartRace ? { scale: 1.02 } : {}}
                whileTap={canStartRace ? { scale: 0.98 } : {}}
              >
                <span className="relative flex items-center justify-center lg:justify-start gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
                  <FiFlag className="text-sm" />
                  Iniciar Carrera
                  <FiChevronRight className={`text-sm transition-transform duration-300 ${
                    canStartRace ? "lg:group-hover:translate-x-1" : ""
                  }`} />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* PANEL DERECHO - SELECCIÓN DE CARROS */}
        <motion.div
          className="flex-1 w-full lg:w-auto min-h-[50vh] lg:min-h-screen p-6 sm:p-8 md:p-10 lg:p-14 lg:pl-10 order-1 lg:order-2"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* BOTÓN VOLVER - VERSIÓN ESCRITORIO */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onBack}
            className="absolute top-6 right-6 z-50 hidden lg:flex items-center gap-2 group p-3"
          >
            <FiArrowLeft className="text-gray-400 text-xl group-hover:text-red-500 transition-colors duration-200" />
            <div className="relative">
              <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                Volver
              </span>
            </div>
          </motion.button>
          
          {/* HEADER ELEGANTE */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 lg:mb-10 gap-4 lg:gap-0 pt-0 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-full sm:w-auto"
            >
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-white/95 tracking-[0.15em] uppercase">
                  Selección de Vehículos
                </h2>
                <div className="h-px flex-1 sm:flex-none sm:w-8 lg:w-12 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <p className="text-[11px] text-white/50 tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500/60" />
                Mínimo {MIN_CARS} para continuar
              </p>
            </motion.div>
            
            {/* SELECT ALL */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              onClick={selectAll}
              className="px-4 py-2 border border-white/[0.06] rounded-sm
                text-[10px] font-medium uppercase tracking-[0.25em] text-white/25 
                hover:text-white/60 hover:border-white/15 hover:bg-white/[0.02]
                transition-all duration-400 w-full sm:w-auto"
            >
              {selectedCars.length === carrosDisponibles.length ? "Limpiar" : "Seleccionar todos"}
            </motion.button>
          </div>

          {/* SCROLL CONTAINER */}
          <div className="relative h-[calc(45vh-120px)] lg:h-[calc(85vh-130px)] rounded-lg border border-white/[0.03] overflow-hidden bg-white/[0.005] backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
            
            <div 
              className="h-full overflow-y-auto pr-1 lg:pr-2 custom-scrollbar"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 2%, black 95%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 2%, black 95%, transparent 100%)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 p-2 pb-12">
                <AnimatePresence mode="popLayout">
                  {carrosDisponibles.map((carro, index) => (
                    <CarCard
                      key={carro.id_carro}
                      carro={carro}
                      index={index}
                      isSelected={selectedCars.includes(carro.id_carro)}
                      onToggle={() => toggleCarSelection(carro.id_carro)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.10);
        }
      `}</style>
    </div>
  );
}

// CAR CARD
function CarCard({ carro, index, isSelected, onToggle }) {
  const equipo = carro.equipo;
  const conductor = carro.conductor;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        delay: index * 0.04, 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      onClick={onToggle}
      className="group relative cursor-pointer"
    >
      <motion.div
        className={`relative rounded-xl overflow-hidden transition-all duration-500
          ${isSelected 
            ? "bg-black/40 ring-1 ring-red-500/40 backdrop-blur-sm" 
            : "bg-black/30 ring-1 ring-white/[0.08] hover:bg-black/40 hover:ring-white/[0.15] backdrop-blur-sm"
          }`}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 sm:p-5">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-1.5 truncate">
                {equipo?.nombre}
              </p>
              <h3 className="text-[15px] sm:text-[16px] font-semibold text-white/95 truncate tracking-tight">
                {carro.nombre}
              </h3>
            </div>
            
            {/* CHECKBOX */}
            <motion.div 
              className={`w-5 h-5 rounded-md border flex items-center justify-center 
                transition-all duration-400 flex-shrink-0 ml-4
                ${isSelected 
                  ? "bg-red-500/90 border-red-500/90" 
                  : "border-white/[0.06] group-hover:border-white/15"
                }`}
              whileTap={{ scale: 0.85 }}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiCheck className="text-white text-xs" strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* CONDUCTOR CON PROGRESS BAR */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.025]">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-400
              ${isSelected ? "bg-red-500/[0.08]" : "bg-white/[0.015]"}`}
            >
              <FiUser className={`text-sm transition-colors duration-400 ${
                isSelected ? "text-red-400/60" : "text-white/20"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/85 truncate mb-1">
                {conductor?.nombre}
              </p>
              {/* HABILIDAD CON PROGRESS */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/50 font-medium">H</span>
                <span className={`text-[12px] font-medium transition-colors duration-400 ${
                  isSelected ? "text-red-400" : "text-white/70"
                }`}>
                  {conductor?.habilidad_h}
                </span>
                <div className="flex-1 h-[2px] bg-white/[0.04] rounded-full overflow-hidden max-w-[60px]">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-400 ${
                      isSelected ? "bg-red-500/50" : "bg-white/15"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${conductor?.habilidad_h}%` }}
                    transition={{ delay: 0.2 + index * 0.03, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STATS CON PROGRESS BARS */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatItem
              icon={<FiZap />}
              label="POT"
              value={carro.P}
              maxValue={45}
              isSelected={isSelected}
              delay={index * 0.03}
            />
            <StatItem
              icon={<FiWind />}
              label="AERO"
              value={carro.A}
              maxValue={45}
              isSelected={isSelected}
              delay={index * 0.03 + 0.1}
            />
            <StatItem
              icon={<FiTarget />}
              label="MAN"
              value={carro.M}
              maxValue={45}
              isSelected={isSelected}
              delay={index * 0.03 + 0.2}
            />
          </div>
        </div>

        {/* BOTTOM LINE INDICATOR */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/60 via-red-500/40 to-red-500/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isSelected ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// STAT ITEM CON PROGRESS BAR
function StatItem({ icon, label, value, maxValue, isSelected, delay }) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1.5 mb-2 transition-colors duration-400
        ${isSelected ? "text-white/60" : "text-white/30"}`}
      >
        <span className="text-[11px]">{icon}</span>
        <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-light mb-2 transition-colors duration-400
        ${isSelected ? "text-white" : "text-white/80"}`}
      >
        {value}
      </p>
      {/* PROGRESS BAR SUTIL */}
      <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden mx-auto max-w-[40px]">
        <motion.div
          className={`h-full rounded-full transition-colors duration-400 ${
            isSelected ? "bg-red-500/60" : "bg-white/30"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3 + delay, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}