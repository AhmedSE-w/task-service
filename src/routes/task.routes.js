const express = require('express');
const {createTask} = require('../controllers/task.controller');

const router = express.Router();

router.post('/v1/tasks', createTask);

module.exports = router;