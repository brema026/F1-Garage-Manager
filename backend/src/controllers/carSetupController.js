const carSetupModel = require('../models/carSetupModel');
const logger = require('../config/logger');

const carSetupController = {
    // Obtener carros de un equipo
    async getTeamCars(req, res) {
        try {
            const { teamId } = req.params;
            
            // Verificar permisos
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== parseInt(teamId)) {
                return res.status(403).json({ error: 'No tienes permiso para ver este equipo' });
            }

            const result = await carSetupModel.getCarsByTeam(teamId);
            res.status(200).json(result.recordset);
        } catch (e) {
            logger.error(`Error obteniendo carros: ${e.message}`);
            res.status(500).json({ error: 'Error obteniendo carros del equipo' });
        }
    },

    // Obtener inventario del equipo
    async getTeamInventory(req, res) {
        try {
            const { teamId } = req.params;

            if (req.user.rol === 'Engineer' && req.user.id_equipo !== parseInt(teamId)) {
                return res.status(403).json({ error: 'No tienes permiso para ver este inventario' });
            }

            const result = await carSetupModel.getTeamInventory(teamId);
            res.status(200).json(result.recordset);
        } catch (e) {
            logger.error(`Error obteniendo inventario: ${e.message}`);
            res.status(500).json({ error: 'Error obteniendo inventario del equipo' });
        }
    },

    // Obtener conductores del equipo
    async getTeamDrivers(req, res) {
        try {
            const { teamId } = req.params;

            if (req.user.rol === 'Engineer' && req.user.id_equipo !== parseInt(teamId)) {
                return res.status(403).json({ error: 'No tienes permiso para ver estos conductores' });
            }

            const result = await carSetupModel.getTeamDrivers(teamId);
            res.status(200).json(result.recordset);
        } catch (e) {
            logger.error(`Error obteniendo conductores: ${e.message}`);
            res.status(500).json({ error: 'Error obteniendo conductores del equipo' });
        }
    },

    // Obtener categorías disponibles
    async getCategories(req, res) {
        try {
            const result = await carSetupModel.getCategories();
            res.status(200).json(result.recordset);
        } catch (e) {
            logger.error(`Error obteniendo categorías: ${e.message}`);
            res.status(500).json({ error: 'Error obteniendo categorías' });
        }
    },

    // Crear un nuevo carro
    async createCar(req, res) {
        try {
            const { id_equipo, nombre } = req.body;

            // Validar permisos
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== parseInt(id_equipo)) {
                return res.status(403).json({ error: 'No tienes permiso para crear carros en este equipo' });
            }

            if (!id_equipo || !nombre) {
                return res.status(400).json({ error: 'Equipo y nombre son requeridos' });
            }

            const result = await carSetupModel.createCar(id_equipo, nombre);
            
            if (result.recordset && result.recordset[0]) {
                logger.info(`Carro creado por ${req.user.nombre}: ${nombre} para equipo ${id_equipo}`);
                res.status(201).json(result.recordset[0]);
            } else {
                res.status(400).json({ error: 'No se pudo crear el carro' });
            }
        } catch (e) {
            logger.error(`Error creando carro: ${e.message}`);
            
            if (e.message.includes('más de 2 carros')) {
                return res.status(400).json({ error: 'El equipo ya tiene el máximo de 2 carros' });
            }
            
            res.status(500).json({ error: 'Error creando el carro' });
        }
    },

    // Instalar o reemplazar parte en carro
    async installPart(req, res) {
        try {
            const { carId } = req.params;
            const { id_pieza, categoria_id } = req.body;

            if (!id_pieza || !categoria_id) {
                return res.status(400).json({ error: 'ID de pieza y categoría son requeridos' });
            }

            // Verificar que el usuario tenga permiso sobre este carro
            const carCheck = await carSetupModel.getCarById(carId);
            if (!carCheck.recordset[0]) {
                return res.status(404).json({ error: 'Carro no encontrado' });
            }

            const car = carCheck.recordset[0];
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== car.id_equipo) {
                return res.status(403).json({ error: 'No tienes permiso para modificar este carro' });
            }

            const result = await carSetupModel.installPart(carId, id_pieza, categoria_id);
            
            logger.info(`Parte instalada en carro ${carId} por ${req.user.nombre}`);
            res.status(200).json({ 
                message: 'Parte instalada correctamente',
                data: result.recordset[0]
            });
        } catch (e) {
            logger.error(`Error instalando parte: ${e.message}`);
            
            if (e.message.includes('inventario')) {
                return res.status(400).json({ error: 'No hay suficiente inventario de esta parte' });
            }
            if (e.message.includes('finalizado')) {
                return res.status(400).json({ error: 'No se puede modificar un carro finalizado' });
            }
            
            res.status(500).json({ error: 'Error instalando la parte' });
        }
    },

    // Asignar conductor a carro
    async assignDriver(req, res) {
        try {
            const { carId } = req.params;
            const { id_conductor } = req.body;

            if (!id_conductor) {
                return res.status(400).json({ error: 'ID de conductor es requerido' });
            }

            // Verificar permisos
            const carCheck = await carSetupModel.getCarById(carId);
            if (!carCheck.recordset[0]) {
                return res.status(404).json({ error: 'Carro no encontrado' });
            }

            const car = carCheck.recordset[0];
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== car.id_equipo) {
                return res.status(403).json({ error: 'No tienes permiso para modificar este carro' });
            }

            const result = await carSetupModel.assignDriver(carId, id_conductor);
            
            logger.info(`Conductor ${id_conductor} asignado a carro ${carId}`);
            res.status(200).json({ 
                message: 'Conductor asignado correctamente',
                data: result.recordset[0]
            });
        } catch (e) {
            logger.error(`Error asignando conductor: ${e.message}`);
            
            if (e.message.includes('equipo')) {
                return res.status(400).json({ error: 'El conductor no pertenece al equipo del carro' });
            }
            
            res.status(500).json({ error: 'Error asignando el conductor' });
        }
    },

    // Finalizar carro
    async finalizeCar(req, res) {
        try {
            const { carId } = req.params;

            // Verificar permisos
            const carCheck = await carSetupModel.getCarById(carId);
            if (!carCheck.recordset[0]) {
                return res.status(404).json({ error: 'Carro no encontrado' });
            }

            const car = carCheck.recordset[0];
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== car.id_equipo) {
                return res.status(403).json({ error: 'No tienes permiso para finalizar este carro' });
            }

            const result = await carSetupModel.finalizeCar(carId);
            
            logger.info(`Carro ${carId} finalizado por ${req.user.nombre}`);
            res.status(200).json({ 
                message: 'Carro finalizado correctamente',
                data: result.recordset[0]
            });
        } catch (e) {
            logger.error(`Error finalizando carro: ${e.message}`);
            
            if (e.message.includes('5 categorías')) {
                return res.status(400).json({ error: 'Debes instalar las 5 categorías de partes antes de finalizar' });
            }
            if (e.message.includes('conductor')) {
                return res.status(400).json({ error: 'Debes asignar un conductor antes de finalizar' });
            }
            
            res.status(500).json({ error: 'Error finalizando el carro' });
        }
    },

    // Desinstalar parte
    async uninstallPart(req, res) {
        try {
            const { carId, categoria_id } = req.params;

            // Verificar permisos
            const carCheck = await carSetupModel.getCarById(carId);
            if (!carCheck.recordset[0]) {
                return res.status(404).json({ error: 'Carro no encontrado' });
            }

            const car = carCheck.recordset[0];
            if (req.user.rol === 'Engineer' && req.user.id_equipo !== car.id_equipo) {
                return res.status(403).json({ error: 'No tienes permiso para modificar este carro' });
            }

            const result = await carSetupModel.uninstallPart(carId, categoria_id);
            
            logger.info(`Parte desinstalada del carro ${carId}`);
            res.status(200).json({ 
                message: 'Parte desinstalada correctamente',
                data: result.recordset[0]
            });
        } catch (e) {
            logger.error(`Error desinstalando parte: ${e.message}`);
            res.status(500).json({ error: 'Error desinstalando la parte' });
        }
    }
};

module.exports = carSetupController;