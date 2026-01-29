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
  FiHash,
  FiLoader,
  FiCheckCircle,
  FiLock,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../../api/axios";

// IMÁGENES DE FONDO ALEATORIAS
const maxImages = 4;
const randomBackgrounds = Array.from({ length: maxImages }, (_, i) =>
  require(`../../assets/circuits/${i + 1}.webp`)
);

const MIN_CARS = 2;
const MAX_CARS = 26;

export default function VehicleSelection({ circuit, onBack, onStartRace, user }) {
  const [selectedCars, setSelectedCars] = useState([]);
  const [randomBackground, setRandomBackground] = useState(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showResultsButton, setShowResultsButton] = useState(false);

  // DATA REAL
  const [carrosDisponibles, setCarrosDisponibles] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [carsError, setCarsError] = useState("");

  // Resultado real del backend
  const [simulationId, setSimulationId] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);

  // Control de rol (tu backend permite ejecutar simulaciones solo Admin)
  const resolvedUser = useMemo(() => {
  if (user) return user;

  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("authUser") ||
      localStorage.getItem("usuario") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("authUser") ||
      sessionStorage.getItem("usuario");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}, [user]);

const role = String(resolvedUser?.rol ?? resolvedUser?.role ?? "")
  .trim()
  .toLowerCase();

const isAdmin = role === "admin";


  useEffect(() => {
    console.log("VehicleSelection user =", user);
    console.log("rol raw =", user?.rol, "type =", typeof user?.rol);
  }, [user]);

  // Usar circuito pasado como prop
  const currentCircuit = circuit;

  // Fondo aleatorio
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomBackgrounds.length);
    setRandomBackground(randomBackgrounds[randomIndex]);
  }, []);

  // Cargar carros elegibles desde backend
  const fetchCars = async () => {
    setLoadingCars(true);
    setCarsError("");

    try {
      // Endpoint real:
      // GET /api/simulations/eligible-cars
      // Retorna carros elegibles: finalizado + setup completo (5) + conductor asignado
      const res = await api.get("/simulations/eligible-cars");
      const rows = Array.isArray(res.data) ? res.data : [];

      // Normalización (backend devuelve plano)
      const normalized = rows.map((c) => ({
        id_carro: Number(c.id_carro),
        nombre: c.nombre ?? "Carro",
        P: Number(c.P ?? 0),
        A: Number(c.A ?? 0),
        M: Number(c.M ?? 0),
        equipo: {
          id_equipo: Number(c.id_equipo ?? 0),
          nombre: c.equipo_nombre ?? "Sin equipo",
        },
        conductor: {
          id_conductor: Number(c.id_conductor ?? 0),
          nombre: c.conductor_nombre ?? "Sin conductor",
          habilidad_h: Number(c.habilidad_h ?? 50),
        },
        setup_id: Number(c.setup_id ?? 0),
      }));

      setCarrosDisponibles(normalized);

      // Si ya tenías seleccionados que ya no existen, limpiar
      setSelectedCars((prev) => prev.filter((id) => normalized.some((x) => x.id_carro === id)));
    } catch (e) {
      console.log("eligible-cars URL DEBUG:", {
        baseURL: e?.config?.baseURL,
        url: e?.config?.url,
        full: (e?.config?.baseURL || "") + (e?.config?.url || ""),
      });

      setCarsError(
        e?.response?.data?.error ||
          `No se pudieron cargar los carros elegibles (status ${e?.response?.status || "?"}).`
      );
      setCarrosDisponibles([]);
      setSelectedCars([]);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => {
    fetchCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCarSelection = (carId) => {
    if (isSimulating) return;

    setSelectedCars((prev) => {
      if (prev.includes(carId)) return prev.filter((id) => id !== carId);
      if (prev.length >= MAX_CARS) return prev;
      return [...prev, carId];
    });
  };

  const selectAll = () => {
    if (isSimulating) return;
    if (selectedCars.length === carrosDisponibles.length) setSelectedCars([]);
    else setSelectedCars(carrosDisponibles.map((c) => c.id_carro));
  };

  const canStartRace =
    selectedCars.length >= MIN_CARS &&
    !isSimulating &&
    !loadingCars &&
    carrosDisponibles.length > 0 &&
    isAdmin; // solo Admin ejecuta

  const startFakeProgress = () => {
    setSimulationProgress(0);
    const startTime = Date.now();
    const duration = 1800; // visual

    const update = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setSimulationProgress(newProgress);
      if (elapsed < duration) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  };

  const handleStartRace = async () => {
    if (!canStartRace) return;

    // Reset UI states
    setIsSimulating(true);
    setShowResultsButton(false);
    setCarsError("");
    setSimulationId(null);
    setSimulationResults([]);

    // Progreso visual
    startFakeProgress();

    try {
      const circuitId = Number(
        currentCircuit?.id_circuito ?? currentCircuit?.id ?? currentCircuit?.circuitId ?? 0
      );

      if (!circuitId) {
        throw new Error("Circuito inválido: falta id_circuito.");
      }

      // Backend real:
      // POST /api/simulations { id_circuito, carros: [ids...] }
      // (si el backend aún no filtra por carros, agregá el filtro como te indiqué)
      const res = await api.post("/simulations", {
        id_circuito: circuitId,
        carros: selectedCars, // ✅ ahora concuerda con la selección del UI
      });

      const id_simulacion = Number(res?.data?.id_simulacion ?? 0);
      const resultados = Array.isArray(res?.data?.resultados) ? res.data.resultados : [];

      if (!id_simulacion) {
        throw new Error("El backend no devolvió id_simulacion.");
      }

      setSimulationId(id_simulacion);
      setSimulationResults(resultados);

      // Cuando ya tenemos respuesta real, habilitamos "Ver Resultados"
      setSimulationProgress(100);
      setShowResultsButton(true);
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.message ||
        "Error ejecutando la simulación. Revisa que existan carros elegibles y setups completos.";
      setCarsError(msg);

      // Volver a permitir interacción
      setIsSimulating(false);
      setShowResultsButton(false);
      setSimulationProgress(0);
      return;
    }
  };

  const handleSeeResults = () => {
    // Carros seleccionados (para la UI de resultados)
    const selectedCarsData = carrosDisponibles.filter((c) => selectedCars.includes(c.id_carro));

    onStartRace({
      id_simulacion: simulationId,
      resultados: simulationResults,
      selectedCars: selectedCarsData,
      circuit: currentCircuit,
    });
  };

  const headerSubtitle = useMemo(() => {
    if (loadingCars) return "Cargando vehículos elegibles...";
    if (carsError) return "No se pudo cargar la lista";
    return `Mínimo ${MIN_CARS} para continuar`;
  }, [loadingCars, carsError]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 font-sans">
      {/* BOTÓN VOLVER SUPERIOR - SIEMPRE VISIBLE EN MÓVIL/TABLET */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={isSimulating ? undefined : onBack}
        disabled={isSimulating}
        className={`absolute top-6 left-6 z-50 flex items-center gap-2 group p-3 lg:hidden ${
          isSimulating ? "cursor-not-allowed" : ""
        }`}
      >
        <div
          className={`relative transition-all duration-300 ${
            isSimulating ? "opacity-40" : "opacity-100"
          }`}
        >
          <FiArrowLeft
            className={`text-xl transition-colors duration-200 ${
              isSimulating ? "text-gray-500" : "text-gray-400 group-hover:text-red-500"
            }`}
          />
          {isSimulating && (
            <div className="absolute -top-1 -right-1">
              <FiLock className="text-[8px] text-red-500/70" />
            </div>
          )}
        </div>
        <div className="relative">
          <span
            className={`text-sm font-black uppercase tracking-[0.2em] transition-colors duration-200 ${
              isSimulating ? "text-gray-500" : "text-gray-400 group-hover:text-red-500"
            }`}
          >
            Volver
          </span>
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
            />
          )}
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
            ease: "easeInOut",
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
      <div
        className="absolute inset-0 z-[1] hidden md:block"
        style={{
          background: `linear-gradient(to right, 
            rgba(10,10,10,0.50) 0%, 
            rgba(10,10,10,0.72) 35%, 
            rgba(10,10,10,0.92) 50%, 
            rgba(10,10,10,0.98) 100%)`,
        }}
      />

      {/* OVERLAY - MÓVIL */}
      <div
        className="absolute inset-0 z-[1] md:hidden"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(0,0,0,0.85) 0%, 
            rgba(0,0,0,0.75) 30%, 
            rgba(0,0,0,0.65) 50%, 
            rgba(0,0,0,0.45) 70%, 
            rgba(0,0,0,0.25) 100%)`,
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
            {/* LOCATION TAG */}
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
                <FiMapPin className="text-[10px] lg:text-[15px]" />
                <span className="text-xl font-medium tracking-widest uppercase">Custom Circuit</span>
              </div>
            </motion.div>

            {/* NOMBRE CIRCUITO */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black uppercase italic tracking-tight text-white leading-[0.9] mb-20 lg:mb-6 text-center lg:text-left"
            >
              {currentCircuit?.name ?? currentCircuit?.nombre ?? "Circuito"}
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
                  <p className="text-[15px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80">
                    Distancia
                  </p>
                </div>
                <p className="text-3xl lg:text-4xl font-extralight text-white/90 tracking-tight">
                  {currentCircuit?.distance ?? currentCircuit?.distancia_d ?? 0}
                  <span className="text-sm text-white/50 ml-1 lg:ml-2 font-normal">km</span>
                </p>
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 mb-2">
                  <FiHash className="text-white/40 text-sm" />
                  <p className="text-[15px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80">
                    Curvas
                  </p>
                </div>
                <p className="text-3xl lg:text-4xl font-extralight text-white/90 tracking-tight">
                  {currentCircuit?.curves ?? currentCircuit?.curvas_c ?? 0}
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
            {/* Mensaje de rol */}
            {!isAdmin && (
              <div className="mb-4 px-4 py-3 border border-white/[0.06] bg-white/[0.02] rounded-lg">
                <div className="flex items-start gap-3">
                  <FiLock className="text-red-400/70 mt-0.5" />
                  <div>
                    <p className="text-white/80 text-sm font-semibold uppercase tracking-[0.15em]">
                      Solo Admin puede ejecutar simulaciones
                    </p>
                    <p className="text-white/45 text-sm mt-1">
                      Podés seleccionar carros, pero el botón de iniciar está bloqueado para tu rol.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {carsError && (
              <div className="mb-4 px-4 py-3 border border-red-500/20 bg-red-500/5 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-300/90 text-sm font-semibold">Error</p>
                    <p className="text-red-200/70 text-sm mt-1">{carsError}</p>
                  </div>
                  {!isSimulating && (
                    <button
                      onClick={fetchCars}
                      className="text-red-200/70 hover:text-red-200 text-sm flex items-center gap-2"
                    >
                      <FiRefreshCw />
                      Reintentar
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 lg:gap-0">
              {/* CONTADOR */}
              <div className="w-full lg:w-auto text-center lg:text-left">
                <p className="text-[16px] font-medium uppercase tracking-[0.3em] lg:tracking-[0.4em] text-white/80 mb-2">
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

              {/* BOTÓN */}
              <div className="w-full lg:w-auto min-w-[280px] max-w-[280px] flex-shrink-0">
                {/* BARRA DE PROGRESO */}
                {isSimulating && (
                  <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${simulationProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!isSimulating ? (
                    <motion.button
                      key="start"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={handleStartRace}
                      disabled={!canStartRace}
                      className={`group relative overflow-hidden w-full px-6 py-4 transition-all duration-700 flex items-center justify-center ${
                        canStartRace
                          ? "cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                          : "cursor-not-allowed bg-white/[0.02] text-white/15 border border-white/[0.04]"
                      }`}
                      whileHover={canStartRace ? { scale: 1.02 } : {}}
                      whileTap={canStartRace ? { scale: 0.98 } : {}}
                    >
                      <span className="flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
                        <FiFlag className="text-sm" />
                        Iniciar Simulación
                        <FiChevronRight
                          className={`text-sm transition-transform duration-300 ${
                            canStartRace ? "lg:group-hover:translate-x-1" : ""
                          }`}
                        />
                      </span>
                    </motion.button>
                  ) : !showResultsButton ? (
                    <motion.button
                      key="simulating"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600/90 to-emerald-700/90 text-white flex items-center justify-center gap-3 disabled:cursor-not-allowed"
                      disabled
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <FiLoader className="text-sm" />
                      </motion.div>
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] whitespace-nowrap">
                        Simulando...
                      </span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
                      }}
                      onClick={handleSeeResults}
                      className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white flex items-center justify-center gap-3 group relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <FiCheckCircle className="text-sm group-hover:scale-110 transition-transform duration-300 relative z-10" />
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] whitespace-nowrap relative z-10">
                        Ver Resultados
                      </span>
                      <FiChevronRight className="text-sm transition-transform duration-300 group-hover:translate-x-1 relative z-10" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
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
          {/* BOTÓN VOLVER - ESCRITORIO */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={isSimulating ? undefined : onBack}
            disabled={isSimulating}
            className={`absolute top-6 right-6 z-50 hidden lg:flex items-center gap-2 group p-3 ${
              isSimulating ? "cursor-not-allowed" : ""
            }`}
          >
            <div
              className={`relative transition-all duration-300 ${
                isSimulating ? "opacity-40" : "opacity-100"
              }`}
            >
              <FiArrowLeft
                className={`text-xl transition-colors duration-200 ${
                  isSimulating ? "text-gray-500" : "text-gray-400 group-hover:text-red-500"
                }`}
              />
              {isSimulating && (
                <div className="absolute -top-1 -right-1">
                  <FiLock className="text-[8px] text-red-500/70" />
                </div>
              )}
            </div>
            <div className="relative">
              <span
                className={`text-sm font-black uppercase tracking-[0.2em] transition-colors duration-200 ${
                  isSimulating ? "text-gray-500" : "text-gray-400 group-hover:text-red-500"
                }`}
              >
                Volver
              </span>
              {isSimulating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
                />
              )}
            </div>
          </motion.button>

          {/* HEADER */}
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
              <p className="text-[15px] text-white/50 tracking-[0.2em] uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-red-500/60" />
                {headerSubtitle}
              </p>
            </motion.div>

            {/* SELECT ALL */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              onClick={selectAll}
              disabled={isSimulating || loadingCars || carrosDisponibles.length === 0}
              className={`px-4 py-2 border rounded-sm text-[13px] font-medium uppercase tracking-[0.25em] transition-all duration-400 w-full sm:w-auto ${
                isSimulating || loadingCars || carrosDisponibles.length === 0
                  ? "border-white/[0.03] text-white/10 cursor-not-allowed bg-white/[0.01]"
                  : "border-white/[0.06] text-white/25 hover:text-white/60 hover:border-white/15 hover:bg-white/[0.02]"
              }`}
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
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 2%, black 95%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 2%, black 95%, transparent 100%)",
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 p-2 pb-12">
                <AnimatePresence mode="popLayout">
                  {loadingCars ? (
                    <LoadingCars />
                  ) : carrosDisponibles.length === 0 ? (
                    <EmptyCars />
                  ) : (
                    carrosDisponibles.map((carro, index) => (
                      <CarCard
                        key={carro.id_carro}
                        carro={carro}
                        index={index}
                        isSelected={selectedCars.includes(carro.id_carro)}
                        onToggle={() => toggleCarSelection(carro.id_carro)}
                        disabled={isSimulating}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-neutral-950 to-transparent z-10 pointer-events-none" />
          </div>
        </motion.div>
      </div>

      {/* SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.04); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.10); }
      `}</style>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function LoadingCars() {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full flex items-center justify-center py-16 text-white/60"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <FiLoader className="text-lg" />
      </motion.div>
      <span className="ml-3 text-sm uppercase tracking-[0.2em]">Cargando...</span>
    </motion.div>
  );
}

function EmptyCars() {
  return (
    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full px-4 py-10">
      <div className="border border-white/[0.06] bg-white/[0.02] rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FiAlertTriangle className="text-red-400/70 mt-0.5" />
          <div>
            <p className="text-white/80 font-semibold uppercase tracking-[0.15em] text-sm">No hay carros elegibles</p>
            <p className="text-white/45 text-sm mt-1">
              Para simular: el carro debe estar <b>finalizado</b>, tener <b>setup actual completo (5 piezas)</b> y un{" "}
              <b>conductor asignado</b>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- CAR CARD ---------------- */

function CarCard({ carro, index, isSelected, onToggle, disabled = false }) {
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
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={disabled ? undefined : onToggle}
      className={`group relative ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <motion.div
        className={`relative rounded-xl overflow-hidden transition-all duration-500
          ${
            isSelected
              ? "bg-black/40 ring-1 ring-red-500/40 backdrop-blur-sm"
              : "bg-black/30 ring-1 ring-white/[0.08] hover:bg-black/40 hover:ring-white/[0.15] backdrop-blur-sm"
          } ${disabled ? "hover:ring-white/[0.08]" : ""}`}
        whileHover={disabled ? {} : { y: -3 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 sm:p-5">
          {/* HEADER */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium uppercase tracking-[0.2em] text-white/40 mb-1.5 truncate">
                {equipo?.nombre}
              </p>
              <h3 className="text-[15px] sm:text-[19px] font-semibold text-white/95 truncate tracking-tight">
                {carro.nombre}
              </h3>
            </div>

            {/* CHECKBOX */}
            <motion.div
              className={`w-5 h-5 rounded-md border flex items-center justify-center 
                transition-all duration-400 flex-shrink-0 ml-4
                ${
                  isSelected ? "bg-red-500/90 border-red-500/90" : "border-white/[0.06] group-hover:border-white/15"
                } ${disabled ? "group-hover:border-white/[0.06]" : ""}`}
              whileTap={disabled ? {} : { scale: 0.85 }}
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

          {/* CONDUCTOR */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.025]">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-400
              ${isSelected ? "bg-red-500/[0.08]" : "bg-white/[0.015]"}`}
            >
              <FiUser
                className={`text-sm transition-colors duration-400 ${
                  isSelected ? "text-red-400/60" : "text-white/20"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] text-white/85 truncate mb-1">{conductor?.nombre}</p>
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-white/50 font-medium">H</span>
                <span
                  className={`text-[14px] font-medium transition-colors duration-400 ${
                    isSelected ? "text-red-400" : "text-white/70"
                  }`}
                >
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

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatItem icon={<FiZap />} label="POT" value={carro.P} maxValue={45} isSelected={isSelected} delay={index * 0.03} />
            <StatItem icon={<FiWind />} label="AERO" value={carro.A} maxValue={45} isSelected={isSelected} delay={index * 0.03 + 0.1} />
            <StatItem icon={<FiTarget />} label="MAN" value={carro.M} maxValue={45} isSelected={isSelected} delay={index * 0.03 + 0.2} />
          </div>
        </div>

        {/* LINE */}
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

function StatItem({ icon, label, value, maxValue, isSelected, delay }) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;
  const percentage = maxValue > 0 ? Math.max(0, Math.min(100, (v / maxValue) * 100)) : 0;

  return (
    <div className="text-center">
      <div
        className={`flex items-center justify-center gap-1.5 mb-2 transition-colors duration-400 ${
          isSelected ? "text-white/60" : "text-white/30"
        }`}
      >
        <span className="text-[13px]">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-light mb-2 transition-colors duration-400 ${isSelected ? "text-white" : "text-white/80"}`}>
        {v}
      </p>
      <div className="h-[2px] bg-white/[0.08] rounded-full overflow-hidden mx-auto max-w-[40px]">
        <motion.div
          className={`h-full rounded-full transition-colors duration-400 ${isSelected ? "bg-red-500/60" : "bg-white/30"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: 0.3 + delay, duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

