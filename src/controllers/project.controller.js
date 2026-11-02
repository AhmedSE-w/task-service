const projectService = require('../services/project.service');

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(req.clientId, req.userId, req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

const listProjects = async (req, res) => {
  const projects = await projectService.listProjects(req.clientId);
  res.json(projects);
};

const getProject = async (req, res) => {
  try {
    const project = await projectService.getProjectDetails(req.clientId, req.params.id);
    res.json(project);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.clientId, req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(error.status || 400).json({error: error.message});
  }
};

module.exports = {createProject, listProjects, getProject, updateProject};
