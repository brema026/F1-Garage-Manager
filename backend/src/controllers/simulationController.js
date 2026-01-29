const simulationModel = require('../models/simulationModel');
const logger = require('../config/logger');

const simulationController = {
  /**
   * POST /api/simulations/run
   * Body: { id_circuito: number }
   * Solo Admin puede ejecutar simulaciones.
   */
  async run(req, res) {
    try {
      const { rol, id_usuario, nombre } = req.user;
      const { id_circuito } = req.body;

      // Autorización por rol
      if (rol !== 'Admin') {
        return res.status(403).json({ error: 'Acceso denegado: solo Admin puede ejecutar simulaciones' });
      }

      // Validación básica
      const circuito = Number(id_circuito);
      if (!circuito || Number.isNaN(circuito) || circuito <= 0) {
        return res.status(400).json({ error: 'id_circuito inválido' });
      }

      const result = await simulationModel.runSimulation(circuito, id_usuario);

      const resultados = result.recordset || [];
      const id_simulacion = resultados.length > 0 ? resultados[0].id_simulacion : null;

      logger.info(`Simulación ejecutada por ${nombre} (Admin). Circuito=${circuito}, Simulación=${id_simulacion}`);

      return res.status(200).json({
        id_simulacion,
        resultados
      });

    } catch (error) {
      logger.error(`Error ejecutando simulación: ${error.message}`);
      return res.status(500).json({ error: 'Error ejecutando simulación' });
    }
  }
};

module.exports = simulationController;
