const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

//Wuadros
router.get('/projects/:projectId/lists', boardController.getListsByProject);
router.post('/projects/:projectId/lists', boardController.createList);

// Atividades
router.put('/activities/:activityId', boardController.updateActivity);
router.delete('/activities/:activityId', boardController.deleteActivity);

//Listas
router.get('/lists/:listId/activities', boardController.getActivitiesByList);
router.post('/lists/:listId/activities', boardController.createActivity);
router.put('/lists/:listId', boardController.updateList);
router.delete('/lists/:listId', boardController.deleteList);


module.exports = router;
