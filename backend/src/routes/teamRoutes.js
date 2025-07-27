const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', teamController.create);
router.get('/', teamController.list);
router.get('/join/:inviteCode', teamController.join);
router.delete('/:teamId/members/:userId', teamController.removeMember);
router.post('/:teamId/leave', teamController.leaveTeam);
router.get('/:teamId/members', teamController.getMembers);
router.post('/:teamId/members/add', teamController.addMemberByEmail);
router.get('/:teamId', teamController.getTeam);

module.exports = router;
