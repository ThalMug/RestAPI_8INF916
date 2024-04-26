const { redisClient } = require('../config/redis');
const { pool } = require('../config/db');

async function registerServer(req, res) {
    const { ip_address } = req.body;
    console.log(ip_address);
    try {
        const newServer = await pool.query(
            'INSERT INTO dedicated_server (server_id, ip_address) VALUES (uuid_generate_v4(), $1) RETURNING *',
            [ip_address]
        );
        res.status(200).json(newServer.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function createSession(req, res) {
    const { serverIp } = req.body;
    try {
        await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());
        res.status(200).json({ message: 'Server session created.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function addPlayer(req, res) {
    const { serverIp, playerUuid } = req.body;
    const serverSessionKey = `server:1:${serverIp}`;
    try {
        await redisClient.sAdd(serverSessionKey, playerUuid);
        await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());
        res.status(200).json({ message: 'Player added to server session.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

module.exports = {
    registerServer,
    createSession,
    addPlayer
};
