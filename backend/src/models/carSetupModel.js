const sql = require('mssql');
const { getPool } = require('../config/database');

const carSetupModel = {
  // Obtener el equipo al que pertenece un carro
  async getCarTeam(id_carro) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, id_carro)
      .query('SELECT id_equipo FROM dbo.carro WHERE id_carro = @id_carro');
  },

  // Instalar una pieza en el setup del carro
  async installPart(id_carro, id_pieza, id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, id_carro)
      .input('id_pieza', sql.Int, id_pieza)
      .input('id_equipo', sql.Int, id_equipo)
      .execute('dbo.sp_instalar_pieza_setup');
  },

  // Remover una pieza del setup del carro
  async removePart(id_carro, category_id, id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, id_carro)
      .input('category_id', sql.Int, category_id)
      .input('id_equipo', sql.Int, id_equipo)
      .execute('dbo.sp_remover_pieza_setup');
  },

  // Finalizar el armado de un carro
  async finalizeCar(id_carro, id_equipo) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, id_carro)
      .input('id_equipo', sql.Int, id_equipo)
      .execute('dbo.sp_finalizar_carro');
  },

  // Obtener el setup actual de un carro
  async getCarSetup(id_carro) {
    const pool = await getPool();
    return pool.request()
      .input('id_carro', sql.Int, id_carro)
      .execute('dbo.sp_obtener_setup_carro');
  },

  // Obtener todos los carros de un equipo con piezas instaladas
  async getTeamCars(id_equipo) {
    const pool = await getPool();
    
    // Obtener carros del equipo
    const carsResult = await pool.request()
      .input('id_equipo', sql.Int, id_equipo)
      .query(`
        SELECT 
          c.id_carro,
          c.nombre,
          c.finalizado,
          c.id_equipo,
          e.nombre AS equipo_nombre,
          cs.setup_id,
          cond.id_conductor,
          cond.nombre AS conductor_nombre
        FROM dbo.carro c
        INNER JOIN dbo.equipo e ON c.id_equipo = e.id_equipo
        LEFT JOIN dbo.car_setup cs ON c.id_carro = cs.car_id AND cs.es_actual = 1
        LEFT JOIN dbo.conductor cond ON cs.id_conductor = cond.id_conductor
        WHERE c.id_equipo = @id_equipo
        ORDER BY c.id_carro
      `);

    // Para cada carro, obtener sus piezas instaladas
    const cars = carsResult.recordset;
    
    for (let car of cars) {
      if (car.setup_id) {
        const piezasResult = await pool.request()
          .input('setup_id', sql.Int, car.setup_id)
          .query(`
            SELECT 
              csp.category_id,
              csp.part_id AS id_pieza,
              p.nombre AS pieza_nombre
            FROM dbo.car_setup_pieza csp
            INNER JOIN dbo.pieza p ON csp.part_id = p.id_pieza
            WHERE csp.setup_id = @setup_id
          `);
        
        // Mapear piezas por categoría
        car.id_potencia = null;
        car.id_aerodinamica = null;
        car.id_neumaticos = null;
        car.id_suspension = null;
        car.id_caja_cambios = null;
        
        piezasResult.recordset.forEach(pieza => {
          switch(pieza.category_id) {
            case 1: car.id_potencia = pieza.id_pieza; break;
            case 2: car.id_aerodinamica = pieza.id_pieza; break;
            case 3: car.id_neumaticos = pieza.id_pieza; break;
            case 4: car.id_suspension = pieza.id_pieza; break;
            case 5: car.id_caja_cambios = pieza.id_pieza; break;
          }
        });
      }
    }

    return { recordset: cars };
  },

  // Obtener todos los carros (para Admin)
  async getAllCars() {
    const pool = await getPool();
    
    const carsResult = await pool.request()
      .query(`
        SELECT 
          c.id_carro,
          c.nombre,
          c.finalizado,
          c.id_equipo,
          e.nombre AS equipo_nombre,
          cs.setup_id,
          cond.id_conductor,
          cond.nombre AS conductor_nombre
        FROM dbo.carro c
        INNER JOIN dbo.equipo e ON c.id_equipo = e.id_equipo
        LEFT JOIN dbo.car_setup cs ON c.id_carro = cs.car_id AND cs.es_actual = 1
        LEFT JOIN dbo.conductor cond ON cs.id_conductor = cond.id_conductor
        ORDER BY e.nombre, c.nombre
      `);

    const cars = carsResult.recordset;
    
    for (let car of cars) {
      if (car.setup_id) {
        const piezasResult = await pool.request()
          .input('setup_id', sql.Int, car.setup_id)
          .query(`
            SELECT 
              csp.category_id,
              csp.part_id AS id_pieza,
              p.nombre AS pieza_nombre
            FROM dbo.car_setup_pieza csp
            INNER JOIN dbo.pieza p ON csp.part_id = p.id_pieza
            WHERE csp.setup_id = @setup_id
          `);
        
        car.id_potencia = null;
        car.id_aerodinamica = null;
        car.id_neumaticos = null;
        car.id_suspension = null;
        car.id_caja_cambios = null;
        
        piezasResult.recordset.forEach(pieza => {
          switch(pieza.category_id) {
            case 1: car.id_potencia = pieza.id_pieza; break;
            case 2: car.id_aerodinamica = pieza.id_pieza; break;
            case 3: car.id_neumaticos = pieza.id_pieza; break;
            case 4: car.id_suspension = pieza.id_pieza; break;
            case 5: car.id_caja_cambios = pieza.id_pieza; break;
          }
        });
      }
    }

    return { recordset: cars };
  },

  // Crear un nuevo carro
  async createCar(id_equipo, nombre) {
    const pool = await getPool();
    
    // Primero verificar que el equipo no tenga ya 2 carros
    const countResult = await pool.request()
      .input('id_equipo', sql.Int, id_equipo)
      .query('SELECT COUNT(*) as total FROM dbo.carro WHERE id_equipo = @id_equipo');
    
    if (countResult.recordset[0].total >= 2) {
      throw new Error('El equipo ya tiene el máximo de 2 carros permitidos');
    }

    // Crear el carro
    return pool.request()
      .input('id_equipo', sql.Int, id_equipo)
      .input('nombre', sql.NVarChar, nombre)
      .query(`
        INSERT INTO dbo.carro (id_equipo, nombre, finalizado)
        OUTPUT INSERTED.*
        VALUES (@id_equipo, @nombre, 0)
      `);
  }
};

module.exports = carSetupModel;