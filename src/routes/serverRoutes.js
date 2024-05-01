const express = require('express');
const { registerServer, addPlayer, removePlayer, getAllPlayerInfo} = require('../controllers/serverController');

const router = express.Router();

router.post('/register', registerServer);
router.post('/add-player', addPlayer);
router.post('/remove-player', removePlayer);
router.get('/getusers/:serverIP', getAllPlayerInfo);

module.exports = router;
