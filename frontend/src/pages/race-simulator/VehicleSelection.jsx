import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { 
  FiArrowLeft, 
  FiCheck, 
  FiZap, 
  FiWind, 
  FiTarget, 
  FiUser, 
  FiFlag,
  FiChevronRight,
  FiMapPin
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// DATA
import { getCarrosFinalizados } from "../../data/CarSelectionData";

// IMÁGENES BIRD EYE DE CIRCUITOS (FONDO)
import monzaBirdEye from "../../assets/circuits/monza-birdEye.webp";
import paulRicardBirdEye from "../../assets/circuits/paulRicard-birdEye.webp";
import portimaBirdEye from "../../assets/circuits/portimao-birdEye.webp";

// IMÁGENES DE CIRCUITOS (TRAZADO)
import monzaImg from "../../assets/circuits/monza.webp";
import portimaoImg from "../../assets/circuits/portimao.webp";
import paulRicardImg from "../../assets/circuits/paulRicard.webp";

// BANDERAS
import italyFlag from "../../assets/circuits/flags/italy.webp";
import franceFlag from "../../assets/circuits/flags/france.webp";
import portugalFlag from "../../assets/circuits/flags/portugal.webp";

// Mapeo de assets por nombre de circuito
const circuitAssets = {
  "Monza": { 
    background: monzaBirdEye, 
    track: monzaImg, 
    flag: italyFlag 
  },
  "Paul Ricard": { 
    background: paulRicardBirdEye, 
    track: paulRicardImg, 
    flag: franceFlag 
  },
  "Portimao": { 
    background: portimaBirdEye, 
    track: portimaoImg, 
    flag: portugalFlag 
  },
};

const MIN_CARS = 2;
const MAX_CARS = 20;

export default function VehicleSelection({ circuit, onBack, onStartRace }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const navigate = useNavigate();

  const carrosDisponibles = useMemo(() => getCarrosFinalizados(), []);
  const assets = circuitAssets[circuit?.name] || circuitAssets["Monza"];

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
      
      {/* ============================================
          FONDO ANIMADO
          ============================================ */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.05 }}
        animate={{ 
          scale: [1.05, 1.12, 1.05],
          x: [0, -20, 0],
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <div
          className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%]"
          style={{
            backgroundImage: `url(${assets.background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </motion.div>

      {/* OVERLAY */}
      <div className="absolute inset-0 z-[1]" 
        style={{
          background: `linear-gradient(to right, 
            rgba(10,10,10,0.50) 0%, 
            rgba(10,10,10,0.72) 35%, 
            rgba(10,10,10,0.92) 50%, 
            rgba(10,10,10,0.98) 100%)`
        }} 
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-neutral-950/70 via-transparent to-neutral-950/30" />
      
      {/* LÍNEA DIVISORA */}
      <div className="absolute top-[10%] bottom-[10%] left-[44%] w-px z-[2]">
        <div className="w-full h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
      </div>

      {/* ============================================
          CONTENIDO PRINCIPAL
          ============================================ */}
      <div className="relative z-10 min-h-screen flex">
        
        {/* ============================================
            PANEL IZQUIERDO - CIRCUITO
            ============================================ */}
        <motion.div 
          className="w-[44%] min-h-screen flex flex-col p-10 lg:p-14"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* BOTÓN VOLVER */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                onClick={onBack}
                className="absolute top-8 left-8 z-50 flex items-center gap-2 group"
            >
                <FiArrowLeft className="text-gray-400 text-xl group-hover:text-red-500 transition-colors duration-200" />
                <div className="relative">
                <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-red-500 transition-colors duration-200">
                    Volver
                </span>
                <motion.div
                    className="absolute -bottom-1 left-0 h-[2px] bg-red-500 w-0 group-hover:w-full"
                    transition={{ duration: 0.2 }}
                />
                </div>
            </motion.button>

          {/* CONTENIDO CENTRAL */}
          <div className="flex-1 flex flex-col justify-center -mt-10">
            
            {/* LOCATION TAG */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="flex items-center gap-3 mb-6"
            >
              <motion.img
                src={assets.flag}
                alt={`${circuit?.location} flag`}
                className="w-8 h-5 object-cover rounded-sm shadow-lg shadow-black/30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
              <div className="flex items-center gap-2 text-white/35">
                <FiMapPin className="text-[10px]" />
                <span className="text-xs font-medium tracking-widest uppercase">
                  {circuit?.location}
                </span>
              </div>
            </motion.div>

            {/* NOMBRE CIRCUITO */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="text-6xl lg:text-7xl xl:text-8xl font-black uppercase italic tracking-tight text-white leading-[0.9] mb-10"
            >
              {circuit?.name}
            </motion.h1>

            {/* IMAGEN TRAZADO */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="relative mb-12"
            >
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-[70%] h-[50%] bg-white/[0.015] rounded-full blur-[80px]" />
              </div>
              
              <motion.img
                src={assets.track}
                alt={`${circuit?.name} layout`}
                className="max-w-[75%] max-h-[200px] object-contain opacity-85
                  drop-shadow-[0_0_50px_rgba(255,255,255,0.04)]"
                whileHover={{ scale: 1.03, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            {/* STATS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex gap-16"
            >
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/20 mb-2">
                  Distancia
                </p>
                <p className="text-4xl font-extralight text-white/90 tracking-tight">
                  {circuit?.km}
                  <span className="text-sm text-white/25 ml-2 font-normal">km</span>
                </p>
              </div>
              
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/20 mb-2">
                  Curvas
                </p>
                <p className="text-4xl font-extralight text-white/90 tracking-tight">
                  {circuit?.curves}
                </p>
              </div>
            </motion.div>
          </div>

          {/* FOOTER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-auto pt-10 border-t border-white/[0.04]"
          >
            <div className="flex items-end justify-between">
              {/* CONTADOR */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-white/20 mb-3">
                  Seleccionados
                </p>
                <div className="flex items-baseline gap-2">
                  <motion.span 
                    className={`text-5xl font-extralight tracking-tight transition-colors duration-700 ${
                      canStartRace ? "text-emerald-400/90" : "text-white/40"
                    }`}
                    key={selectedCars.length}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {selectedCars.length}
                  </motion.span>
                  <span className="text-lg text-white/10 font-light">
                    / {carrosDisponibles.length}
                  </span>
                </div>
              </div>

              {/* BOTÓN INICIAR */}
              <motion.button
                onClick={handleStartRace}
                disabled={!canStartRace}
                className={`group relative overflow-hidden px-8 py-4 transition-all duration-700 ${
                  canStartRace
                    ? "cursor-pointer bg-white text-neutral-900"
                    : "cursor-not-allowed bg-white/[0.02] text-white/15 border border-white/[0.04]"
                }`}
                whileHover={canStartRace ? { scale: 1.02 } : {}}
                whileTap={canStartRace ? { scale: 0.98 } : {}}
              >
                <span className="relative flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
                  <FiFlag className="text-sm" />
                  Iniciar
                  <FiChevronRight className={`text-sm transition-transform duration-300 ${
                    canStartRace ? "group-hover:translate-x-1" : ""
                  }`} />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* ============================================
            PANEL DERECHO - SELECCIÓN DE CARROS
            ============================================ */}
        <motion.div
          className="flex-1 min-h-screen p-10 lg:p-14 pl-10"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          {/* HEADER ELEGANTE */}
          <div className="flex items-end justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white tracking-[0.15em] uppercase">
                  Vehículos
                </h2>
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/30 tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500/60" />
                Mínimo {MIN_CARS} para continuar
              </p>
            </motion.div>
            
            {/* SELECT ALL CON BORDE */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              onClick={selectAll}
              className="px-4 py-2 border border-white/[0.06] rounded-sm
                text-[10px] font-medium uppercase tracking-[0.25em] text-white/25 
                hover:text-white/60 hover:border-white/15 hover:bg-white/[0.02]
                transition-all duration-400"
            >
              {selectedCars.length === carrosDisponibles.length ? "Limpiar" : "Seleccionar todos"}
            </motion.button>
          </div>

          {/* SCROLL CONTAINER */}
          <div className="relative h-[calc(100vh-200px)]">
            <div className="absolute top-0 left-0 right-4 h-6 bg-gradient-to-b from-neutral-950 to-transparent z-10 pointer-events-none" />
            
            <div 
              className="h-full overflow-y-auto pr-4 custom-scrollbar"
              style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 1.5%, black 93%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 1.5%, black 93%, transparent 100%)",
              }}
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 py-3 pb-16">
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

            <div className="absolute bottom-0 left-0 right-4 h-16 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />
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

// ============================================
// CAR CARD
// ============================================
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
            ? "bg-white/[0.025] ring-1 ring-red-500/30" 
            : "bg-white/[0.008] ring-1 ring-white/[0.03] hover:bg-white/[0.018] hover:ring-white/[0.07]"
          }`}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/15 mb-1.5 truncate">
                {equipo?.nombre}
              </p>
              <h3 className="text-[15px] font-semibold text-white/90 truncate tracking-tight">
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
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-400
              ${isSelected ? "bg-red-500/[0.08]" : "bg-white/[0.015]"}`}
            >
              <FiUser className={`text-sm transition-colors duration-400 ${
                isSelected ? "text-red-400/60" : "text-white/20"
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70 truncate mb-1">
                {conductor?.nombre}
              </p>
              {/* HABILIDAD CON PROGRESS */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/25">H</span>
                <span className={`text-[11px] font-medium transition-colors duration-400 ${
                  isSelected ? "text-red-400/80" : "text-white/40"
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
          <div className="grid grid-cols-3 gap-4">
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

// ============================================
// STAT ITEM CON PROGRESS BAR
// ============================================
function StatItem({ icon, label, value, maxValue, isSelected, delay }) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 mb-1.5 transition-colors duration-400
        ${isSelected ? "text-white/35" : "text-white/15"}`}
      >
        <span className="text-[10px]">{icon}</span>
        <span className="text-[8px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-lg font-light mb-2 transition-colors duration-400
        ${isSelected ? "text-white" : "text-white/50"}`}
      >
        {value}
      </p>
      {/* PROGRESS BAR SUTIL */}
      <div className="h-[2px] bg-white/[0.03] rounded-full overflow-hidden mx-auto max-w-[40px]">
        <motion.div
          className={`h-full rounded-full transition-colors duration-400 ${
            isSelected ? "bg-red-500/40" : "bg-white/10"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3 + delay, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}