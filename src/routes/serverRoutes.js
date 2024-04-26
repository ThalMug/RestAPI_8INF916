const express = require('express');
const { registerServer, createSession, addPlayer } = require('../controllers/serverController');

const router = express.Router();

router.post('/register', registerServer);
router.post('/create-session', createSession);
router.post('/add-player', addPlayer);

module.exports = router;
