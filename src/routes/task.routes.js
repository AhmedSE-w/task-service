const express = require('express');
const {createTask, listTasks} = require('../controllers/task.controller');
const {authenticate} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, createTask);
router.get('/v1/tasks', authenticate, listTasks);

module.exports = router;