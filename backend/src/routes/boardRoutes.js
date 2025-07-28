const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
//quadros
router.get('/projects/:projectId/lists', boardController.getListsByProject);
router.post('/projects/:projectId/lists', boardController.createList);
router.delete('/lists/:listId', boardController.deleteList);

// Atividades
router.get('/lists/:listId/activities', boardController.getActivitiesByList);
router.post('/lists/:listId/activities', boardController.createActivity);
router.put('/activities/:activityId', boardController.updateActivity);
router.delete('/activities/:activityId', boardController.deleteActivity);

module.exports = router;
