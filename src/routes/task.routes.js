const express = require('express');
const {createTask} = require('../controllers/task.controller');
const {authenticate} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, createTask);

module.exports = router;