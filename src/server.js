const sequelize = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    }); 
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

start();