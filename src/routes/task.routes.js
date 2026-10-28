const express = require('express');
const {createTask, listTasks, getTask, updateTask, listTaskEvents} = require('../controllers/task.controller');
const {authenticate} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, createTask);
router.get('/v1/tasks', authenticate, listTasks);
router.get('/v1/tasks/:id', authenticate, getTask);
router.patch('/v1/tasks/:id', authenticate, updateTask);
router.get('/v1/tasks/:id/events', authenticate, listTaskEvents);

module.exports = router;