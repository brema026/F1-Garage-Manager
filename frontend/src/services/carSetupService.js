// frontend/src/services/carSetupService.js
import axios from '../api/axios';

const carSetupService = {
    // Obtener carros de un equipo
    async getTeamCars(teamId) {
        const response = await axios.get(`/car-setup/team/${teamId}/cars`);
        return response.data;
    },

    // Obtener inventario del equipo
    async getTeamInventory(teamId) {
        const response = await axios.get(`/car-setup/team/${teamId}/inventory`);
        return response.data;
    },

    // Obtener conductores del equipo
    async getTeamDrivers(teamId) {
        const response = await axios.get(`/car-setup/team/${teamId}/drivers`);
        return response.data;
    },

    // Crear un nuevo carro
    async createCar(id_equipo, nombre, descripcion) {
        const response = await axios.post('/car-setup/car', {
            id_equipo,
            nombre,
            descripcion
        });
        return response.data;
    },

    // Instalar una parte en un carro
    async installPart(carId, id_pieza, categoria_id) {
        const response = await axios.put(`/car-setup/car/${carId}/part`, {
            id_pieza,
            categoria_id
        });
        return response.data;
    },

    // Asignar conductor a un carro
    async assignDriver(carId, id_conductor) {
        const response = await axios.put(`/car-setup/car/${carId}/driver`, {
            id_conductor
        });
        return response.data;
    },

    // Finalizar carro
    async finalizeCar(carId) {
        const response = await axios.put(`/car-setup/car/${carId}/finalize`);
        return response.data;
    },

    // Desinstalar una parte
    async uninstallPart(carId, categoria_id) {
        const response = await axios.delete(`/car-setup/car/${carId}/part/${categoria_id}`);
        return response.data;
    }
};

export default carSetupService;