const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');


router.use(authMiddleware);

router.post('/', projectController.create);

router.get('/', projectController.getUserProjects);

module.exports = router;
