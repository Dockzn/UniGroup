const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', projectController.create);
router.get('/user', projectController.getUserProjects);
router.get('/team/:teamId', projectController.list);
router.patch('/:projectId/favorite', projectController.toggleFavorite);
router.patch('/:projectId/archive', projectController.archive);

module.exports = router;
