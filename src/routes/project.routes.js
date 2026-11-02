const express = require('express');
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  assignProjectTasks,
} = require('../controllers/project.controller');
const {authenticate, requireManager} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/projects', authenticate, requireManager, createProject);
router.get('/v1/projects', authenticate, listProjects);
router.get('/v1/projects/:id', authenticate, getProject);
router.patch('/v1/projects/:id', authenticate, requireManager, updateProject);
router.post('/v1/projects/:id/assign', authenticate, requireManager, assignProjectTasks);

module.exports = router;
