const { redisClient } = require('../config/redis');
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const verifyJWT = require('../verifyJWT');

async function registerServer(req, res) {
    console.log(req.headers);
    let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (clientIp.includes(',')) {
        clientIp = clientIp.split(',')[0];  // In case the header includes multiple IP addresses
    }

    console.log(`Your IP address is ${clientIp}`);
    let ip_address = req.ip;
    if (ip_address.substr(0, 7) === "::ffff:") {
        ip_address = ip_address.substr(7);
    }
    req.ip_address = ip_address;
    console.log(ip_address);
    try {
        const newServer = await pool.query(
            'INSERT INTO dedicated_server (server_id, ip_address) VALUES (uuid_generate_v4(), $1) RETURNING *',
            [ip_address]
        );

        const token = jwt.sign(
            {
                user_id: newServer.rows[0].server_id,
                role: "dedicated game server"
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );


        res.status(200).json({ message: 'Success', token: token, server: newServer.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function createSession(req, res) {
    const { serverIp } = req.body;
    verifyJWT(req, res, async function () {
        const { user_id, role } = req;
        if (role != "dedicated game server") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());
            res.status(200).json({ message: 'Server session created.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });
}

async function addPlayer(req, res) {
    const { serverIp, playerUuid } = req.body;
    const serverSessionKey = `server:1:${serverIp}`;
    verifyJWT(req, res, async function () {
        const { user_id, role } = req;
        if (role != "dedicated game server") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            await redisClient.sAdd(serverSessionKey, playerUuid);
            await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());
            res.status(200).json({ message: 'Player added to server session.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });
}

module.exports = {
    registerServer,
    createSession,
    addPlayer
};
