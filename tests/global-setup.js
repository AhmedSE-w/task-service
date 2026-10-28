const {PostgreSqlContainer} = require('@testcontainers/postgresql');
const {execSync} = require('child_process');

module.exports = async () => {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start();

  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getPort());
  process.env.DB_NAME = container.getDatabase();
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();

  execSync('pnpm exec sequelize-cli db:migrate', {stdio:'inherit'});

  globalThis.dbContainer = container;
};