const { getPool } = require('../config/database');

const categoryModel = {
  async getAll() {
    const pool = await getPool();
    return pool.request().execute('sp_listar_categorias');
  }
};

module.exports = categoryModel;