const express = require('express');
const { registerUser, loginUser, getUserAchievements, unlockUserAchievement } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/achievements/:userId', getUserAchievements);
router.post('/achievements/unlock', unlockUserAchievement);
router.post('/friend_add', addFriend);
router.get('/friend_get/:userId', getFriends);


module.exports = router;
