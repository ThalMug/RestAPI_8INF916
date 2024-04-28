const express = require('express');
const { addAchievement, getAchievement,unlockAchievement } = require('../controllers/achievementController');

const router = express.Router();

router.post('/add', addAchievement);
router.post('/unlock', unlockAchievement);
router.get('/get/:name', getAchievement);

module.exports = router;
