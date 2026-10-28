const express = require('express');
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  listTaskEvents,
  addComment,
  listComments,
} = require('../controllers/task.controller');
const {authenticate} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, createTask);
router.get('/v1/tasks', authenticate, listTasks);
router.get('/v1/tasks/:id', authenticate, getTask);
router.patch('/v1/tasks/:id', authenticate, updateTask);
router.get('/v1/tasks/:id/events', authenticate, listTaskEvents);
router.post('/v1/tasks/:id/comments', authenticate, addComment);
router.get('/v1/tasks/:id/comments', authenticate, listComments);

module.exports = router;
