const express = require('express');
const { getServerWithBestRankAndKda } = require('../controllers/matchmakingController');

const router = express.Router();

router.post('/join-server', getServerWithBestRankAndKda);

module.exports = router;
