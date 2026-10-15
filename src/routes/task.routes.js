const express = require('express');
const {createTask, listTasks, getTask} = require('../controllers/task.controller');
const {authenticate} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, createTask);
router.get('/v1/tasks', authenticate, listTasks);
router.get('/v1/tasks/:id', authenticate, getTask);

module.exports = router;