const carSetupModel = require('../models/carSetupModel');
const logger = require('../config/logger');

const carSetupController = {
  // Instalar una pieza en el setup del carro
  async installPart(req, res) {
    try {
      const { id_carro } = req.params;
      const { id_pieza } = req.body;
      
      // Si es Admin, obtener el equipo del carro. Si no, usar el equipo del usuario
      let id_equipo = req.user.id_equipo;

      if (!id_pieza) {
        return res.status(400).json({ error: 'El ID de la pieza es requerido' });
      }

      if (!id_carro) {
        return res.status(400).json({ error: 'El ID del carro es requerido' });
      }

      // Si el usuario no tiene equipo (Admin), obtener el equipo del carro
      if (!id_equipo) {
        if (req.user.rol !== 'Admin') {
          return res.status(403).json({ error: 'Tu usuario no tiene un equipo asignado' });
        }
        
        // Obtener el equipo del carro
        const carResult = await carSetupModel.getCarTeam(parseInt(id_carro));
        if (!carResult.recordset || carResult.recordset.length === 0) {
          return res.status(404).json({ error: 'El carro con ID ' + id_carro + ' no fue encontrado' });
        }
        id_equipo = carResult.recordset[0].id_equipo;
      }

      const result = await carSetupModel.installPart(
        parseInt(id_carro),
        parseInt(id_pieza),
        id_equipo
      );

      logger.info(`Parte instalada en carro ${id_carro} por ${req.user.nombre}`);
      res.status(200).json({
        message: 'Pieza instalada correctamente',
        data: result.recordset[0]
      });

    } catch (e) {
      logger.error(`Error instalando parte: ${e.message}`);
      // Usar el mensaje del error SQL directamente para máxima claridad
      res.status(400).json({ error: e.message });
    }
  },

  // Remover una pieza del setup del carro
  async removePart(req, res) {
    try {
      const { id_carro, category_id } = req.params;
      
      let id_equipo = req.user.id_equipo;

      if (!id_carro || !category_id) {
        return res.status(400).json({ error: 'El ID del carro y la categoría son requeridos' });
      }

      // Si el usuario no tiene equipo (Admin), obtener el equipo del carro
      if (!id_equipo) {
        if (req.user.rol !== 'Admin') {
          return res.status(403).json({ error: 'Tu usuario no tiene un equipo asignado' });
        }
        
        const carResult = await carSetupModel.getCarTeam(parseInt(id_carro));
        if (!carResult.recordset || carResult.recordset.length === 0) {
          return res.status(404).json({ error: 'El carro con ID ' + id_carro + ' no fue encontrado' });
        }
        id_equipo = carResult.recordset[0].id_equipo;
      }

      await carSetupModel.removePart(
        parseInt(id_carro),
        parseInt(category_id),
        id_equipo
      );

      logger.info(`Parte removida del carro ${id_carro} por ${req.user.nombre}`);
      res.status(200).json({ message: 'Pieza removida correctamente' });

    } catch (e) {
      logger.error(`Error removiendo parte: ${e.message}`);
      res.status(400).json({ error: e.message });
    }
  },

  // Finalizar el armado de un carro
  async finalizeCar(req, res) {
    try {
      const { id_carro } = req.params;
      
      let id_equipo = req.user.id_equipo;

      // Si el usuario no tiene equipo (Admin), obtener el equipo del carro
      if (!id_equipo) {
        if (req.user.rol !== 'Admin') {
          return res.status(403).json({ error: 'Tu usuario no tiene un equipo asignado' });
        }
        
        const carResult = await carSetupModel.getCarTeam(parseInt(id_carro));
        if (!carResult.recordset || carResult.recordset.length === 0) {
          return res.status(404).json({ error: 'Carro no encontrado' });
        }
        id_equipo = carResult.recordset[0].id_equipo;
      }

      const result = await carSetupModel.finalizeCar(parseInt(id_carro), id_equipo);

      logger.info(`Carro ${id_carro} finalizado por ${req.user.nombre}`);
      res.status(200).json({ 
        message: 'Carro finalizado correctamente',
        data: result.recordset[0]
      });

    } catch (e) {
      logger.error(`Error finalizando carro: ${e.message}`);
      // Extraer el mensaje específico del error SQL
      const errorMsg = e.message || 'Error al finalizar el carro';
      res.status(400).json({ error: errorMsg });
    }
  },

  // Asignar conductor a un carro
  async assignDriver(req, res) {
    try {
      const { id_carro } = req.params;
      const { id_conductor } = req.body;
      
      let id_equipo = req.user.id_equipo;

      if (!id_conductor) {
        return res.status(400).json({ error: 'ID de conductor es requerido' });
      }

      // Si el usuario no tiene equipo (Admin), obtener el equipo del carro
      if (!id_equipo) {
        if (req.user.rol !== 'Admin') {
          return res.status(403).json({ error: 'Tu usuario no tiene un equipo asignado' });
        }
        
        const carResult = await carSetupModel.getCarTeam(parseInt(id_carro));
        if (!carResult.recordset || carResult.recordset.length === 0) {
          return res.status(404).json({ error: 'Carro no encontrado' });
        }
        id_equipo = carResult.recordset[0].id_equipo;
      }

      const result = await carSetupModel.assignDriver(
        parseInt(id_carro),
        parseInt(id_conductor),
        id_equipo
      );

      logger.info(`Conductor ${id_conductor} asignado al carro ${id_carro} por ${req.user.nombre}`);
      res.status(200).json({
        message: 'Conductor asignado correctamente',
        data: result.recordset[0]
      });

    } catch (e) {
      logger.error(`Error asignando conductor: ${e.message}`);
      const errorMsg = e.message || 'Error al asignar conductor';
      res.status(400).json({ error: errorMsg });
    }
  },

  // Obtener el setup actual de un carro
  async getCarSetup(req, res) {
    try {
      const { id_carro } = req.params;

      const result = await carSetupModel.getCarSetup(parseInt(id_carro));

      res.status(200).json(result.recordset);

    } catch (e) {
      logger.error(`Error obteniendo setup del carro: ${e.message}`);
      res.status(500).json({ error: 'Error obteniendo setup del carro' });
    }
  },

  // Obtener todos los carros de un equipo
  async getTeamCars(req, res) {
    try {
      let id_equipo = req.user.id_equipo;

      // Si es Admin sin equipo, obtener todos los carros
      if (!id_equipo) {
        if (req.user.rol !== 'Admin') {
          return res.status(403).json({ error: 'Tu usuario no tiene un equipo asignado' });
        }
        
        // Para Admin, obtener todos los carros
        const result = await carSetupModel.getAllCars();
        return res.status(200).json(result.recordset);
      }

      const result = await carSetupModel.getTeamCars(id_equipo);
      res.status(200).json(result.recordset);

    } catch (e) {
      logger.error(`Error obteniendo carros del equipo: ${e.message}`);
      res.status(500).json({ error: 'Error obteniendo carros del equipo' });
    }
  },

  // Crear un nuevo carro
  async createCar(req, res) {
    try {
      const { nombre, id_equipo: body_id_equipo } = req.body;
      
      // Permitir que Admin especifique el equipo en el body
      let id_equipo = req.user.id_equipo || body_id_equipo;

      if (!nombre) {
        return res.status(400).json({ error: 'Nombre del carro es requerido' });
      }

      if (!id_equipo) {
        return res.status(400).json({ 
          error: 'Debes especificar un equipo para el carro' 
        });
      }

      const result = await carSetupModel.createCar(id_equipo, nombre);

      logger.info(`Carro creado: ${nombre} para equipo ${id_equipo} por ${req.user.nombre}`);
      res.status(201).json(result.recordset[0]);

    } catch (e) {
      logger.error(`Error creando carro: ${e.message}`);
      res.status(500).json({ error: e.message });
    }
  }
};

module.exports = carSetupController;