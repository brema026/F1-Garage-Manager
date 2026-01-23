import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// VIDEOS
import onboard01 from "../../assets/circuits/backgroundVideos/onboard-01.mp4";
import onboard02 from "../../assets/circuits/backgroundVideos/onboard-02.mp4";

// IMÁGENES CIRCUITOS
import monzaImg from "../../assets/circuits/monza.webp";
import portimaoImg from "../../assets/circuits/portimao.webp";
import paulRicardImg from "../../assets/circuits/paulRicard.webp";

// BANDERAS
import italyFlag from "../../assets/circuits/flags/italy.webp";
import franceFlag from "../../assets/circuits/flags/france.webp";
import portugalFlag from "../../assets/circuits/flags/portugal.webp";

const circuits = [
  { id: 1, name: "Monza", location: "Italia", flag: italyFlag, image: monzaImg, km: 5.793, curves: 11 },
  { id: 2, name: "Paul Ricard", location: "Francia", flag: franceFlag, image: paulRicardImg, km: 5.842, curves: 15 },
  { id: 3, name: "Portimao", location: "Portugal", flag: portugalFlag, image: portimaoImg, km: 4.653, curves: 16 },
];

export default function CircuitSelection({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [randomVideo, setRandomVideo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const videos = [onboard01, onboard02];
    const chosenVideo = videos[Math.floor(Math.random() * videos.length)];
    setRandomVideo(chosenVideo);
  }, []);

  const handleSelect = (circuit) => {
    setSelected(circuit.id);
    setTimeout(() => onSelect(circuit), 600);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start lg:justify-center bg-black text-white overflow-hidden font-sans">

      {/* --- BOTÓN VOLVER RESPONSIVE --- */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        transition={{ duration: 0.4 }}
        className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 flex items-center gap-2 group p-2 sm:p-3"
      >
        <FiArrowLeft className="text-lg sm:text-xl lg:text-xl group-hover:text-red-500 transition duration-200" />
        <span className="text-xs sm:text-sm lg:text-sm font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] lg:tracking-[0.2em] text-gray-400 group-hover:text-red-500">
          Volver
        </span>
      </motion.button>

      {/* --- VIDEO DE FONDO --- */}
      {randomVideo && (
        <motion.video
          key={randomVideo}
          autoPlay loop muted playsInline preload="metadata"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover scale-110"
        >
          <source src={randomVideo} type="video/mp4" />
        </motion.video>
      )}

      {/* OVERLAY OSCURO */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80 pointer-events-none"></div>

      {/* --- TÍTULO --- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 mt-14 sm:mt-16 mb-8 sm:mb-10 text-center px-4"
      >
        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight">
          <span className="text-white">Selecciona tu</span>
          <br />
          <motion.span
            className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-600 to-yellow-500"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            Circuito
          </motion.span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-gray-400">
          SIMULACIÓN DE CARRERAS
        </p>
      </motion.div>

      {/* --- GRID DE CIRCUITOS RESPONSIVE --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 w-full max-w-7xl z-10 pb-8 lg:pb-10">
        {circuits.map((circuit, index) => (
          <motion.div
            key={circuit.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.45 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleSelect(circuit)}
            className={`relative rounded-3xl p-[2px] cursor-pointer transition-all duration-300
              ${selected === circuit.id
                ? "bg-transparent ring-2 ring-red-500/60"
                : "bg-white/10 hover:bg-white/20 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              }
            `}
          >
            {/* Card interno */}
            <div className="bg-black/60 backdrop-blur-md rounded-[22px] overflow-hidden flex flex-col h-full">

              {/* Imagen */}
              <div className="relative h-48 md:h-56 flex items-center justify-center p-8">
                <motion.img
                  src={circuit.image}
                  alt={circuit.name}
                  className="max-w-full max-h-full object-contain opacity-90"
                  whileHover={{ scale: 1.12 }}
                  transition={{ duration: 0.25 }}
                />
              </div>

              {/* Info */}
              <div className="px-6 pb-6">
                <h2 className="text-2xl md:text-2xl font-extrabold italic uppercase group-hover:text-[#E10600] transition-colors">
                  {circuit.name}
                </h2>

                <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-1 mb-4 flex items-center gap-2">
                  <img src={circuit.flag} className="w-5 h-3 object-cover rounded-sm" alt="" />
                  {circuit.location}
                </p>

                <div className="flex justify-between text-gray-200 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Distancia</span>
                    <p className="font-bold text-lg italic">{circuit.km} km</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400">Curvas</span>
                    <p className="font-bold text-lg italic">{circuit.curves}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selección Glow */}
            <AnimatePresence>
              {selected === circuit.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl border-2 border-red-500/70 pointer-events-none"
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      {/* FOOTER */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="text-gray-400 uppercase text-[11px] tracking-[0.5em] font-bold z-10 mb-3 sm:mb-3"
      >
        Elige tu circuito inicial
      </motion.p>
    </div>
  );
}
