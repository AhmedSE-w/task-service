require('dotenv').config();

const settings = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
};

module.exports = {
  development: settings,
  test: settings,
  production: settings,
};