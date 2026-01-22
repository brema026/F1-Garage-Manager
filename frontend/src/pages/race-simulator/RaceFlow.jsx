import { useState } from "react";
import CircuitSelection from "./CircuitSelection";
import VehicleSelection from "./VehicleSelection";
import { AnimatePresence, motion } from "framer-motion";

export default function RaceFlow() {
  // Estado para el circuito elegido
  const [selectedCircuit, setSelectedCircuit] = useState(null);

  // Función para manejar la selección del circuito
  const handleCircuitSelect = (circuit) => {
    setSelectedCircuit(circuit);
  };

  // Función para volver atrás (limpiar el circuito)
  const handleBack = () => {
    setSelectedCircuit(null);
  };

  const handleStartRace = (cars) => {
    console.log("Iniciando carrera en:", selectedCircuit.name);
    console.log("Vehículos seleccionados:", cars);
    // Aquí iría la lógica para navegar a la simulación
  };

  return (
    <div className="bg-black min-h-screen">
      <AnimatePresence mode="wait">
        {!selectedCircuit ? (
          <motion.div
            key="circuit-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CircuitSelection onSelect={handleCircuitSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="vehicle-selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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