const path = require('path');
const { Sequelize } = require('sequelize');

// Charge les identifiants Postgres depuis .db.env (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD)
require('dotenv').config({ path: path.join(__dirname, '..', '.db.env'), quiet: true });

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    // 'localhost' si l'API tourne sur la machine, 'db' si elle tourne dans le compose
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
