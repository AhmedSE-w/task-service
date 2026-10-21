const express = require('express');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');
const OpenApiValidator = require('express-openapi-validator');
const healthRoutes = require('./routes/health.routes');
const taskRoutes = require('./routes/task.routes');

const openapiDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, 'docs/openapi.yaml'), 'utf8'),
);

const app = express();

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(OpenApiValidator.middleware({apiSpec: openapiDocument, validateRequests: true}));
app.use(healthRoutes);
app.use(taskRoutes);
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({error: error.message});
});

module.exports = app;
