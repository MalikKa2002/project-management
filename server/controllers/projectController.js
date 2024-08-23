const { v4: uuidv4 } = require('uuid');
const { getAllProjects, saveProjects } = require('../models/projectModel');
const validateProject = require('../projectValidation');
const validateEditedProject = require('../editedValidation');
const usedIds = new Set();
//generating id unique for the projects like you want
function generateCustomId(length = 13) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let result;
    
    do {
        result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    } while (usedIds.has(result));
    
    usedIds.add(result);
    return result;
}
//creat the project
const createProject = async (req, res) => {
  try {
    await validateProject(req.body);
    const projects = getAllProjects();
    const newProject = {
      id: generateCustomId(),
      ...req.body,
      images: [],
      team: req.body.team || [],
      start_date: req.body.start_date || new Date().toISOString(),
    };
    projects[newProject.id] = newProject;
    saveProjects(projects);
    res.status(201).send(newProject);
  } catch (error) {
    res.status(400).send({ errors: error.errors });
  }
};
//update the project
const updateProject = async (req, res) => {
    try {
      await validateEditedProject(req.body);
      const projects = getAllProjects();
      const { projectId } = req.params;
      if (!projects[projectId]) {
        return res.status(404).send({ message: 'Project not found' });
      }
      projects[projectId] = { ...projects[projectId], ...req.body };
      projects[projectId].name = req.body.name;
      saveProjects(projects);
      res.send(projects[projectId]);
    } catch (error) {
      res.status(400).send({ errors: error.errors });
    }
  };
//delete the project
const deleteProject = (req, res) => {
  const projects = getAllProjects();
  const { projectId } = req.params;
  if (!projects[projectId]) {
    return res.status(404).send({ message: 'Project not found' });
  }
  delete projects[projectId];
  saveProjects(projects);
  res.send({ message: 'Project deleted' });
};

//delete the image for a project
const deleteImageFromProject = (req, res) => {
  const projects = getAllProjects();
  const { projectId, imageId } = req.params;
  
  const project = projects[projectId];
  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }

  const imageIndex = project.images.findIndex(image => image.id === imageId);
  if (imageIndex === -1) {
    return res.status(404).send({ message: 'Image not found' });
  }

  project.images.splice(imageIndex, 1);
  saveProjects(projects);
  
  res.send({ message: 'Image deleted' });
};

const getProject = (req, res) => {
  const projects = getAllProjects();
  const { projectId } = req.params;
  const project = projects[projectId];
  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }
  res.send(project);
};

const getProjects = (req, res) => {
  const projects = getAllProjects();
  res.send(Object.values(projects));
};

const getImages = async (req, res) => {
 
  const projects = getAllProjects();
  const { projectId } = req.params;
  const project = projects[projectId];
  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }
  res.send(project.images);
};
//add images to the project
const addImageToProject = async (req, res) => {

  const { projectId } = req.params;
  const url = req.body;
  const {id:imageId} =url;
  const projects = getAllProjects();
  const project = projects[projectId];

  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }
  try {

    let imageExists = project.images.some(image => image.id === imageId);

    if (imageExists) {
        return res.status(400).send({ message: 'Image already exists in the project' });
    }

    project.images.push(url);
    
    saveProjects(projects);
    res.send(url);
  } catch (error) {
    res.status(500).send({ message: 'Error adding image' });
  }
};


//add a member to the project
const addMemberToProject = (req, res) => {
  const { projectId } = req.params;
  const { name, email, role } = req.body;
  const projects = getAllProjects();
  const project = projects[projectId];
  if (!project) {
    return res.status(404).send({ message: 'Project not found' });
  }
  const newMember = { id: uuidv4(), name, email, role };
  project.team.push(newMember);
  saveProjects(projects);
  res.send(newMember);
};

module.exports = {
  createProject,
  updateProject,
  deleteProject,
  getProject,
  getProjects,
  addImageToProject,
  deleteImageFromProject,
  addMemberToProject,
  getImages,
};
