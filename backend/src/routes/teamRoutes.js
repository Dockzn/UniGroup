const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', teamController.create);
router.get('/', teamController.list);
router.get('/join/:inviteCode', teamController.join);

module.exports = router;
