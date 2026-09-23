require('dotenv').config();
const { connectDB, closeDB } = require('../src/config/database');

async function main() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT DB_NAME() AS database_name,
      (SELECT COUNT(*) FROM dbo.equipo) AS teams,
      (SELECT COUNT(*) FROM dbo.part_category) AS categories
  `);
  const row = result.recordset[0];
  console.log(`Database '${row.database_name}' is ready (${row.teams} teams, ${row.categories} categories).`);
}

main()
  .catch(() => {
    console.error('Database validation failed. Check backend/.env and the setup order.');
    process.exitCode = 1;
  })
  .finally(closeDB);
