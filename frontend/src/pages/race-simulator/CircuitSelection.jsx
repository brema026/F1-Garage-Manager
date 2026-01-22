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
    setTimeout(() => onSelect(circuit), 700);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden font-sans">

      {/* BOTÓN VOLVER */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 group"
      >
        <FiArrowLeft className="text-xl group-hover:text-red-500 transition-colors duration-200" />
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

      {/* VIDEO DE FONDO */}
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

      {/* OVERLAY GRADIENTE */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70 pointer-events-none"></div>

      {/* TÍTULO CON GRADIENT */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 mb-12 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tight">
          <span className="text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">Selecciona tu</span>
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

      {/* GRID DE CIRCUITOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-10 w-full max-w-7xl z-10">
        {circuits.map((circuit, index) => (
          <motion.div
            key={circuit.id}
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: "easeInOut" }}
            whileHover={{ scale: 1.1, rotateX: 3, rotateY: -3 }}
            className={`relative rounded-3xl p-[1px] cursor-pointer group transition-all duration-300
              ${selected === circuit.id
                ? "bg-red-500 shadow-[0_0_50px_rgba(225,6,0,0.35)]"
                : "bg-white/15 hover:bg-white/30 shadow-[0_0_20px_rgba(0,0,0,0.25)]"
              }
            `}
            onClick={() => handleSelect(circuit)}
          >
            {/* CARD TRANSPARENTE */}
            <div className="bg-black/50 backdrop-blur-md rounded-[23px] overflow-hidden h-full relative">
              
              {/* GLOW INTERNO */}
              <motion.div
                className="absolute inset-0 rounded-[23px] pointer-events-none"
                animate={{
                  boxShadow: selected === circuit.id
                    ? "0 0 50px rgba(225,6,0,0.35), inset 0 0 30px rgba(255,255,255,0.05)"
                    : "inset 0 0 15px rgba(255,255,255,0.05)"
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* IMAGEN */}
              <div className="relative h-64 flex items-center justify-center p-12">
                <div className="absolute w-1/2 h-1/2 rounded-full bg-white/5 blur-[40px] group-hover:bg-red-500/25 transition-colors duration-400"></div>

                <motion.img
                  src={circuit.image}
                  alt={circuit.name}
                  className="relative max-w-full max-h-full object-contain opacity-90
                  brightness-125 contrast-110
                  drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]
                  group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]
                  transition-all duration-400"
                  whileHover={{ scale: 1.18 }}
                />
              </div>

              {/* INFORMACIÓN */}
              <div className="px-8 pb-8 relative">
                <h2 className="text-3xl font-extrabold italic uppercase tracking-tighter
                group-hover:text-[#E10600] transition-colors duration-300">
                  {circuit.name}
                </h2>

                <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-1 mb-6 flex items-center gap-2">
                  <motion.img
                    src={circuit.flag}
                    alt={`${circuit.location} flag`}
                    className="w-5 h-3 object-contain rounded-sm"
                    whileHover={{ scale: 1.25, rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                  {circuit.location}
                </p>

                <div className="flex justify-between text-gray-200 border-t border-white/10 pt-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                      Distancia
                    </span>
                    <p className="font-bold text-lg italic">{circuit.km} km</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block mb-1">
                      Curvas
                    </span>
                    <p className="font-bold text-lg italic">{circuit.curves}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* OVERLAY DE SELECCIÓN */}
            <AnimatePresence>
              {selected === circuit.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl border-2 border-red-500 pointer-events-none"
                  transition={{ duration: 0.6 }}
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
        className="mt-16 text-gray-400 uppercase text-[11px] tracking-[0.5em] font-bold z-10"
      >
        Elige tu circuito inicial
      </motion.p>
    </div>
  );
}
