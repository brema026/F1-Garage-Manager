import { useState } from "react";
import CircuitSelection from "./CircuitSelection";
import VehicleSelection from "./VehicleSelection";
import RaceResults from "./RaceResults";
import SimulationsHistory from "./SimulationsHistory";
import { AnimatePresence, motion } from "framer-motion";

export default function RaceFlow() {
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [selectedCars, setSelectedCars] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [simulationData, setSimulationData] = useState(null);

  const handleCircuitSelect = (circuit) => {
    setSelectedCircuit(circuit);
  };

  const handleBack = () => {
    setSelectedCircuit(null);
    setSelectedCars([]);
    setShowResults(false);
    setShowHistory(false);
  };

  const handleStartRace = (cars) => {
    console.log("Simulación completada para:", selectedCircuit.name);
    console.log("Vehículos:", cars);
    
    // Preparar datos de simulación
    const simulationData = {
      circuit: selectedCircuit,
      cars: cars,
      timestamp: new Date().toISOString(),
      results: null // Se llenaría con datos reales de la API
    };
    
    setSelectedCars(cars);
    setSimulationData(simulationData);
    setShowResults(true);
    setShowHistory(false);
  };

  const handleBackFromResults = () => {
    setShowResults(false);
    setSelectedCircuit(null);
    setSelectedCars([]);
    setShowHistory(false);
  };

  const handleShowHistory = () => {
    setShowHistory(true);
    setShowResults(false);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  const handleSimulationClick = (simulation) => {
    console.log("Simulación seleccionada del historial:", simulation);
    const dummySimulationData = {
      circuit: {
        id: simulation.id,
        name: simulation.circuit_name,
        distance: 5.793, 
        curves: 15
      },
      cars: [],
      timestamp: simulation.date + "T" + simulation.time,
      results: null
    };
    
    setSimulationData(dummySimulationData);
    setShowResults(true);
    setShowHistory(false);
  };

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence mode="wait">
        {showResults ? (
          <motion.div
            key="race-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RaceResults 
              onBack={handleBackFromResults}
              circuit={selectedCircuit}
              cars={selectedCars}
              simulationData={simulationData}
            />
          </motion.div>
        ) : showHistory ? (
          <motion.div
            key="simulations-history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SimulationsHistory 
              onBack={handleBackFromHistory}
              onSimulationClick={handleSimulationClick}
            />
          </motion.div>
        ) : !selectedCircuit ? (
          <motion.div
            key="circuit-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CircuitSelection 
              onSelect={handleCircuitSelect}
              onShowHistory={handleShowHistory}
            />
          </motion.div>
        ) : (
          <motion.div
            key="vehicle-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VehicleSelection 
              circuit={selectedCircuit} 
              onBack={handleBack} 
              onStartRace={handleStartRace} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}