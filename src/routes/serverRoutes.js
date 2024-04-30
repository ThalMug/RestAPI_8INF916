const express = require('express');
const { registerServer, createSession, addPlayer, removePlayer, getAllPlayerInfo} = require('../controllers/serverController');

const router = express.Router();

router.post('/register', registerServer);
router.post('/create-session', createSession);
router.post('/add-player', addPlayer);
router.post('/remove-player', removePlayer);
router.get('/getusers/:serverIP', getAllPlayerInfo);

module.exports = router;
