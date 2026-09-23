require('dotenv').config();
const { connectDB, closeDB } = require('../src/config/database');
const authService = require('../src/services/authService');

async function main() {
  const nombre = process.env.BOOTSTRAP_ADMIN_NAME;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!nombre || !email || !password || [nombre, email, password].some(value => /^YOUR_/i.test(value))) {
    throw new Error('Set BOOTSTRAP_ADMIN_NAME, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD for this command.');
  }

  await connectDB();
  const user = await authService.createAccount(
    { nombre, email, password, rol: 'Admin', id_equipo: 0 },
    { rol: 'Admin' }
  );
  console.log(`Admin account created for ${user.email || email}. Remove BOOTSTRAP_ADMIN_* from the environment now.`);
}

main()
  .catch((error) => {
    console.error(error.code === 'EMAIL_EXISTS' ? 'That administrator email already exists.' : error.message);
    process.exitCode = 1;
  })
  .finally(closeDB);
