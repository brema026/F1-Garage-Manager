const categoryModel = require('../models/categoryModel');
const logger = require('../config/logger');

const categoryController = {
  async getCategories(req, res) {
    try {
      const result = await categoryModel.getAll();
      res.status(200).json(result.recordset);
    } catch (e) {
      logger.error(`Error fetching categories: ${e.message}`);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  }
};

module.exports = categoryController;
