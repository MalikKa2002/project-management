const express = require('express');
const {
    createProject,
    updateProject,
    deleteProject,
    deleteImageFromProject,
    getProject,
    getProjects,
    addImageToProject,
    addMemberToProject,
    getImages,
} = require('../controllers/projectController');

const router = express.Router();
//routing 
router.post('/', createProject);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);
router.delete('/:projectId/images/:imageId',deleteImageFromProject );
router.get('/:projectId', getProject);
router.get('/', getProjects);
router.get('/:projectId/images', getImages);
router.post('/:projectId/images', addImageToProject);
router.post('/:projectId/team', addMemberToProject);
module.exports = router;
