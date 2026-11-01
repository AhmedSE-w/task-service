const express = require('express');
const {createProject, listProjects} = require('../controllers/project.controller');
const {authenticate, requireManager} = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/v1/projects', authenticate, requireManager, createProject);
router.get('/v1/projects', authenticate, listProjects);

module.exports = router;
