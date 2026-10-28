const express = require('express');
const healthRoutes = require('./routes/health.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();

app.use(express.json());
app.use(healthRoutes);
app.use(taskRoutes);

module.exports = app;