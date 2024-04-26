const express = require('express');
const { addAchievement, getAchievement } = require('../controllers/achievementController');

const router = express.Router();

router.post('/add', addAchievement);
router.get('/get/:name', getAchievement);

module.exports = router;
