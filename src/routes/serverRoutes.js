const express = require('express');
const { registerServer, createSession, addPlayer, getAllPlayerInfo} = require('../controllers/serverController');

const router = express.Router();

router.post('/register', registerServer);
router.post('/add-player', addPlayer);
router.get('/getusers/:serverIP', getAllPlayerInfo);

module.exports = router;
