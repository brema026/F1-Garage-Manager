import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  FiFlag,
  FiChevronLeft,
  FiChevronDown,
  FiBarChart2,
  FiAlertTriangle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Imagen de fondo
import resultsBg from "../../assets/circuits/results.jpg";

// Dummy fallback SOLO cuando no hay simulationData
import { raceResultsData } from "../../data/RaceResultsData";
import { formatTime, formatDiff } from "../../utils/helpers";

/* ---------------- helpers anti-crash ---------------- */

function toNum(x, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function safeToFixed(x, decimals = 3, fallback = "—") {
  const n = Number(x);
  if (!Number.isFinite(n)) return fallback;
  return n.toFixed(decimals);
}

function safeFormatTime(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s)) return "—";
  try {
    return formatTime(s);
  } catch {
    return `${safeToFixed(s, 3)}s`;
  }
}

function safeFormatDiff(diff) {
  const d = Number(diff);
  if (!Number.isFinite(d)) return "—";
  try {
    return formatDiff(d);
  } catch {
    return d === 0 ? "WIN" : `+${safeToFixed(d, 3)}s`;
  }
}

/**
 * Normaliza resultados para que tu UI siempre reciba:
 * { id, position, driver, team, carNumber, P,A,M,H, timeSeconds, diff, penalty, Vrecta, Vcurva, car, carSetup }
 *
 * NOTA: tu backend ya te manda exactamente estos campos, pero esto te protege
 * por si alguna vez cambias el payload.
 */
function normalizeResults(rawResults = []) {
  const arr = Array.isArray(rawResults) ? rawResults : [];

  return arr.map((r, idx) => {
    const timeSeconds =
      r.timeSeconds ??
      r.tiempo ??
      r.tiempo_total ??
      r.tiempo_segundos ??
      r.total_seconds;

    const penalty = r.penalty ?? r.penalizacion ?? r.penalty_seconds ?? 0;

    const diff = r.diff ?? r.dif ?? r.diferencia ?? r.delta ?? NaN;

    return {
      id: r.id ?? r.id_resultado ?? r.id_carro ?? `${idx}`,
      position: r.position ?? r.pos ?? r.posicion ?? idx + 1,
      driver: r.driver ?? r.piloto ?? r.conductor ?? r.conductor_nombre ?? "—",
      team: r.team ?? r.equipo ?? r.equipo_nombre ?? "—",
      carNumber: r.carNumber ?? r.numero ?? r.numero_carro ?? r.id_carro ?? "—",
      P: r.P ?? r.pot ?? r.potencia ?? 0,
      A: r.A ?? r.aero ?? r.aerodinamica ?? 0,
      M: r.M ?? r.man ?? r.manejo ?? 0,
      H: r.H ?? r.hab ?? r.habilidad ?? r.habilidad_h ?? 0,
      timeSeconds: toNum(timeSeconds, NaN),
      diff: toNum(diff, NaN),
      penalty: toNum(penalty, 0),
      Vrecta: toNum(r.Vrecta ?? r.v_recta ?? r.vel_recta, 0),
      Vcurva: toNum(r.Vcurva ?? r.v_curva ?? r.vel_curva, 0),
      car: r.car ?? r.carro ?? r.nombre_carro ?? "N/A",
      carSetup: r.carSetup ?? r.setup ?? null,
    };
  });
}

/**
 * Si no viene diff, lo calculamos contra el primero (por seguridad).
 * También ordenamos por position si viene desordenado.
 */
function ensureOrderingAndDiff(results = []) {
  const arr = Array.isArray(results) ? [...results] : [];
  arr.sort((a, b) => toNum(a.position, 9999) - toNum(b.position, 9999));

  const base = toNum(arr[0]?.timeSeconds, NaN);
  if (!Number.isFinite(base)) return arr;

  return arr.map((r, i) => {
    const t = toNum(r.timeSeconds, NaN);
    const hasDiff = Number.isFinite(toNum(r.diff, NaN));

    return {
      ...r,
      position: toNum(r.position, i + 1),
      diff: hasDiff ? r.diff : (Number.isFinite(t) ? t - base : NaN),
    };
  });
}

export default function RaceResults({ onBack, circuit, cars, simulationData }) {
  const [isLoading, setIsLoading] = useState(true);
  const [visibleResults, setVisibleResults] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  // ✅ Si hay simulationData => NO dummy
  const rawResults = useMemo(() => {
    if (simulationData) {
      const r = simulationData?.resultados ?? simulationData?.results ?? [];
      return Array.isArray(r) ? r : [];
    }
    return raceResultsData?.results ?? [];
  }, [simulationData]);

  const results = useMemo(() => {
    const normalized = normalizeResults(rawResults);
    return ensureOrderingAndDiff(normalized);
  }, [rawResults]);

  const circuitName =
    circuit?.name ||
    circuit?.nombre ||
    simulationData?.circuit?.name ||
    raceResultsData?.circuitName ||
    "Circuito";

  // Animación de “entrar de a poquitos”
  useEffect(() => {
    setIsLoading(true);
    setVisibleResults([]);
    setExpandedRow(null);

    const timer = setTimeout(() => {
      setIsLoading(false);

      if (!results || results.length === 0) return;

      results.forEach((result, index) => {
        setTimeout(() => {
          setVisibleResults((prev) => [...prev, result]);
        }, index * 60);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [results]);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate("/");
  };

  const toggleRowExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const handleGrafanaClick = (result) => {
    console.log(`Abriendo Grafana para: ${result.driver} - ${result.car}`);
  };

  const hasResults = results && results.length > 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-950 font-sans">
      {/* FONDO */}
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
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            backgroundImage: `url(${resultsBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.5)",
          }}
        />
      </motion.div>

      {/* OVERLAY */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `linear-gradient(to bottom,
            rgba(10,10,10,0.75) 0%,
            rgba(10,10,10,0.68) 30%,
            rgba(10,10,10,0.62) 50%,
            rgba(10,10,10,0.55) 70%,
            rgba(10,10,10,0.5) 100%)`,
        }}
      />

      {/* CONTENIDO */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-5 lg:p-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* HEADER */}
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
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-0.5">
                      RESULTADOS DE SIMULACIÓN
                    </p>
                    <p className="text-sm font-medium text-white">{circuitName}</p>
                  </div>
                </div>

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

          {/* RESULTADOS */}
          <div className="relative h-[calc(100vh-280px)] min-h-[500px] max-h-[700px] rounded-lg border border-white/[0.04] overflow-hidden bg-black/10 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-neutral-950/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-neutral-950/70 to-transparent z-10 pointer-events-none" />

            <div className="h-full flex flex-col">
              {/* CABECERA FIJA */}
              <div className="hidden lg:block bg-black/30 backdrop-blur-md border-b border-white/[0.03] px-3 py-3 sticky top-0 z-20">
                <div className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      POS
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      PILOTO
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      EQUIPO
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      POT
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      AERO
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      MAN
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      HAB
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      TIEMPO
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      DIF
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center h-full">
                    <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gray-400">
                      DET
                    </span>
                  </div>
                </div>
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto custom-scroll-elegant px-1 backdrop-blur-sm">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-10 h-10 border border-red-500/20 border-t-red-500 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-400 uppercase tracking-widest text-xs">
                        Cargando resultados...
                      </p>
                    </div>
                  </div>
                ) : !hasResults ? (
                  <div className="h-full flex items-center justify-center px-4">
                    <div className="max-w-xl w-full border border-white/[0.06] bg-black/30 backdrop-blur-md rounded-xl p-6">
                      <div className="flex items-start gap-3">
                        <FiAlertTriangle className="text-red-400/80 mt-0.5" />
                        <div>
                          <p className="text-white/90 font-semibold uppercase tracking-[0.15em] text-sm">
                            No hay resultados para mostrar
                          </p>
                          <p className="text-white/50 text-sm mt-2">
                            La simulación terminó pero el backend no devolvió resultados (o vienen vacíos).
                            Revisá el response del POST <b>/simulations</b> y asegurate que mande <b>resultados</b>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
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
                              ease: "easeOut",
                            }}
                          >
                            <div className="hidden lg:block">
                              <ResultRowDesktop
                                result={result}
                                isExpanded={expandedRow === result.id}
                                onToggleExpand={() => toggleRowExpand(result.id)}
                                onGrafanaClick={() => handleGrafanaClick(result)}
                              />
                            </div>

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

      {/* SCROLLBAR */}
      <style>{`
        .custom-scroll-elegant::-webkit-scrollbar { width: 4px; background: transparent; }
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
        .custom-scroll-elegant::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
        .custom-scroll-elegant::-webkit-scrollbar-thumb:active { background: rgba(255, 255, 255, 0.3); }
        .custom-scroll-elegant::-webkit-scrollbar-corner { background: transparent; }
      `}</style>
    </div>
  );
}

/* ---------------- ROWS ---------------- */

function ResultRowDesktop({ result, isExpanded, onToggleExpand, onGrafanaClick }) {
  const timeSeconds = toNum(result.timeSeconds, NaN);
  const penalty = toNum(result.penalty, 0);
  const net = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds - penalty) : NaN;

  return (
    <motion.div className="group relative" whileHover={{ scale: 1.001 }}>
      <div
        onClick={onToggleExpand}
        className="grid grid-cols-12 gap-1 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-black/35 backdrop-blur-md"
        style={{ height: "48px" }}
      >
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
            {toNum(result.position, 0)}
          </div>
        </div>

        <div className="col-span-2 flex items-center">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-white/90 truncate">{result.driver}</h3>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] truncate">#{result.carNumber}</p>
          </div>
        </div>

        <div className="col-span-2 flex items-center justify-start">
          <p className="text-[13px] text-gray-300 font-medium truncate">{result.team}</p>
        </div>

        {["P", "A", "M", "H"].map((k) => (
          <div key={k} className="col-span-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {toNum(result[k], 0)}
            </div>
          </div>
        ))}

        <div className="col-span-1 flex items-center justify-center">
          <div className="text-[13px] font-mono font-medium truncate text-white/80">
            {safeFormatTime(result.timeSeconds)}
          </div>
        </div>

        <div className="col-span-1 flex items-center justify-center">
          <div
            className={`text-[13px] px-2 py-1 rounded-full border inline-block backdrop-blur-md ${
              toNum(result.diff, NaN) === 0
                ? "bg-emerald-900/20 text-emerald-300 border-emerald-800/30"
                : "bg-black/30 text-gray-400 border-white/[0.05]"
            }`}
          >
            {safeFormatDiff(result.diff)}
          </div>
        </div>

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

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-black/30 backdrop-blur-md rounded-lg border border-white/[0.05]">
              <div className="p-4 border-b border-white/[0.04]">
                <div className="grid grid-cols-4 gap-4">
                  <BoxStat label="VEL. RECTA" value={`${toNum(result.Vrecta, 0)}`} unit="km/h" />
                  <BoxStat label="VEL. CURVA" value={`${toNum(result.Vcurva, 0)}`} unit="km/h" />
                  <BoxStat
                    label="PENALIZACIÓN"
                    value={toNum(result.penalty, 0) > 0 ? `${toNum(result.penalty, 0)}` : "—"}
                    unit={toNum(result.penalty, 0) > 0 ? "s" : ""}
                    accent={toNum(result.penalty, 0) > 0 ? "text-red-300" : "text-gray-400"}
                  />
                  <BoxStat label="TIEMPO NETO" value={safeToFixed(net, 3, "—")} unit="s" mono />
                </div>
              </div>

              <div className="p-4 border-b border-white/[0.04]">
                <div className="flex items-center justify-center">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGrafanaClick();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 backdrop-blur-md bg-gradient-to-r from-orange-900/20 to-yellow-800/10 text-orange-300 border-orange-800/30 hover:border-orange-700/50 hover:text-orange-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiBarChart2 className="text-sm" />
                    <span className="text-[13px] font-medium uppercase tracking-[0.15em]">VER GRAFANA</span>
                  </motion.button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2 uppercase tracking-[0.2em]">
                  Análisis detallado de telemetría
                </p>
              </div>

              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                  SETUP DEL CARRO |{" "}
                  <span className="text-white/90 font-medium ml-1.5">{result.car || "N/A"}</span>
                </p>

                {!result.carSetup ? (
                  <div className="text-sm text-white/50">No hay detalle de setup (por ahora). ✔️</div>
                ) : (
                  <div className="text-sm text-white/50">
                    Setup disponible (podés mapearlo cuando el backend lo envíe).
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ResultRowMobile({ result, isExpanded, onToggleExpand, onGrafanaClick }) {
  const timeSeconds = toNum(result.timeSeconds, NaN);
  const penalty = toNum(result.penalty, 0);
  const net = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds - penalty) : NaN;

  return (
    <motion.div className="group relative" whileHover={{ scale: 1.002 }}>
      <div
        onClick={onToggleExpand}
        className="p-2.5 rounded-lg border transition-all duration-200 cursor-pointer bg-black/30 border-white/[0.04] hover:border-white/[0.1] hover:bg-black/35 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
              {toNum(result.position, 0)}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white/90">{result.driver}</h3>
              <p className="text-[9px] text-gray-400">
                #{result.carNumber} • {result.team}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-white/80">{safeFormatTime(result.timeSeconds)}</div>
            <div
              className={`text-[10px] px-2 py-0.5 rounded-full border mt-0.5 backdrop-blur-md ${
                toNum(result.diff, NaN) === 0
                  ? "bg-emerald-900/20 text-emerald-300 border-emerald-800/30"
                  : "bg-black/30 text-gray-400 border-white/[0.05]"
              }`}
            >
              {safeFormatDiff(result.diff)}
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-2 px-1">
          {[
            { k: "P", label: "POT" },
            { k: "A", label: "AERO" },
            { k: "M", label: "MAN" },
            { k: "H", label: "HAB" },
          ].map((x) => (
            <div key={x.k} className="text-center">
              <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mx-auto mb-1 border-white/[0.08] bg-black/30 text-white/80 backdrop-blur-md">
                {toNum(result[x.k], 0)}
              </div>
              <div className="text-[7px] uppercase tracking-[0.2em] text-gray-400">{x.label}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-1">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="p-1 rounded border border-white/[0.06] hover:border-white/[0.12] hover:bg-black/30 transition-all duration-150 backdrop-blur-md flex items-center gap-1"
          >
            <FiChevronDown className="text-white/40 text-[10px]" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-white/[0.04] mt-3">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <MiniStat label="V. RECTA" value={`${toNum(result.Vrecta, 0)} km/h`} />
                  <MiniStat label="V. CURVA" value={`${toNum(result.Vcurva, 0)} km/h`} />
                  <MiniStat
                    label="PENALIZACIÓN"
                    value={toNum(result.penalty, 0) > 0 ? `${toNum(result.penalty, 0)}s` : "—"}
                  />
                  <MiniStat label="TIEMPO NETO" value={`${safeToFixed(net, 3, "—")} s`} mono />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-center">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onGrafanaClick();
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-200 backdrop-blur-md bg-gradient-to-r from-blue-900/20 to-blue-800/10 text-blue-300 border-blue-800/30 hover:border-blue-700/50 hover:text-blue-200 w-full max-w-xs"
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

                <div className="text-[10px] text-white/60">
                  Setup: <span className="text-white/80">{result.car || "N/A"}</span> •{" "}
                  {result.carSetup ? "con detalle" : "sin detalle (por ahora)"}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ---------------- small UI bits ---------------- */

function BoxStat({ label, value, unit, mono = false, accent = "text-white" }) {
  return (
    <div className="text-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 mb-2">{label}</p>
      <div className={`text-base font-light ${accent} ${mono ? "font-mono" : ""}`}>
        {value}
        {unit ? <span className="text-xs text-gray-400 ml-1">{unit}</span> : null}
      </div>
    </div>
  );
}

function MiniStat({ label, value, mono = false }) {
  return (
    <div className="bg-black/25 rounded p-2 border border-white/[0.04] backdrop-blur-md">
      <span className="text-[8px] uppercase tracking-[0.25em] text-gray-400 block mb-1">{label}</span>
      <div className={`text-sm font-light text-white ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
