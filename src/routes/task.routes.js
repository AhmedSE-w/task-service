const express = require('express');
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  listTaskEvents,
  addComment,
  listComments,
  transitionTask,
  assignTask,
  decideItem,
  createTasksBulk,
} = require('../controllers/task.controller');
const {authenticate, requireManager} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/tasks', authenticate, requireManager, createTask);
router.get('/v1/tasks', authenticate, listTasks);
router.get('/v1/tasks/:id', authenticate, getTask);
router.patch('/v1/tasks/:id', authenticate, updateTask);
router.get('/v1/tasks/:id/events', authenticate, listTaskEvents);
router.post('/v1/tasks/:id/comments', authenticate, addComment);
router.get('/v1/tasks/:id/comments', authenticate, listComments);
router.post('/v1/tasks/:id/transition', authenticate, transitionTask);
router.post('/v1/tasks/:id/assign', authenticate, requireManager, assignTask);
router.post('/v1/tasks/:id/items/:itemId/decision', authenticate, decideItem);
router.post('/v1/tasks/bulk', authenticate, requireManager, createTasksBulk);

module.exports = router;
