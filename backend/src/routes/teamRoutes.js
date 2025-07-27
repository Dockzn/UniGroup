const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');



router.post('/', teamController.create);
router.get('/:teamId', teamController.getTeamById);
router.get('/:teamId/members', teamController.getMembers);
router.post('/:teamId/add-member', teamController.addMemberByEmail);

module.exports = router;
 