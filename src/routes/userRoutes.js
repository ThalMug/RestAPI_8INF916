const express = require('express');
const { registerUser, loginUser, getUserAchievements } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/achievements/:userId', getUserAchievements);

module.exports = router;
