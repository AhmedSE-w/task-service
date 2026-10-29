const express = require('express');
const {createWorkflow} = require('../controllers/workflow.controller');
const {authenticate, requireAdmin} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/workflows', authenticate, requireAdmin, createWorkflow);

module.exports = router;
