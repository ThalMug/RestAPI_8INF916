const { redisClient } = require('../config/redis');
const { pool } = require('../config/db');

async function registerServer(req, res) {
    let ip_address  = req.ip;

    if (ip_address === '::1') {
        ip_address = '127.0.0.1';
    }
    
    try {
        // Register the server in the PostgreSQL database
        const newServer = await pool.query(
            'INSERT INTO dedicated_server (server_id, ip_address) VALUES (uuid_generate_v4(), $1) RETURNING *',
            [ip_address]
        );
        const serverSessionKey = `session:${ip_address}`;
        const exists = await redisClient.exists(serverSessionKey);
        if (!exists) {
            await redisClient.sAdd(serverSessionKey, 'init'); 
            
            console.log(`Server session created for IP: ${ip_address}`);
        } else {
            console.log(`Session already exists for IP: ${ip_address}`);
        }
        res.status(200).json({ message: 'Server session created.', server: newServer.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function addPlayer(req, res) {
    const { playerUuid } = req.body;
    let serverIP = req.ip;
    
    if (serverIP === '::1') {
        serverIP = '127.0.0.1';
    }
    
    const serverSessionKey = `session:${serverIP}`;
    try {
        // Fetch player information from the database
        const queryResult = await pool.query(
            'SELECT rank, kda FROM users WHERE uuid = $1',
            [playerUuid]
        );

        if (queryResult.rows.length === 0) {
            res.status(404).json({ message: 'Player not found.' });
            return;
        }

        const playerData = queryResult.rows[0];
        playerData.uuid = playerUuid;  // Add UUID to the player data

        // Store player information in Redis under a unique key
        const playerKey = `player:${playerUuid}`;
        await redisClient.hSet(playerKey, {
            'uuid': playerUuid,
            'rank': playerData.rank.toString(),
            'kDa': playerData.kda.toString()
        });

        // Add player UUID to the server session set
        await redisClient.sAdd(serverSessionKey, playerUuid);
        console.log(`Player data retrieved and added to session: ${playerUuid}`);
        res.status(200).json({ message: 'Player added to server session.', playerData });
    } catch (err) {
        console.error('Database or Redis error:', err.message);
        res.status(500).send('Server error');
    }
}

async function getAllPlayerInfo(req, res) {
    let serverIP = req.ip;

    if (serverIP === '::1') {
        serverIP = '127.0.0.1';
    }
    
    const serverSessionKey = `session:${serverIP}`;
    try {
        const playerUUIDs = await redisClient.sMembers(serverSessionKey);
        const playersInfo = [];
        
        for (const uuid of playerUUIDs) {
            const playerKey = `player:${uuid}`;
            const playerData = await redisClient.hGetAll(playerKey);
            if (Object.keys(playerData).length > 0) {
                playersInfo.push(playerData);
            }
        }

        console.log(`All players in server ${serverIP}:`, playersInfo);
        return playersInfo;
    } catch (err) {
        console.error('Error retrieving player information:', err.message);
        return [];
    }
}

module.exports = {
    registerServer,
    addPlayer,
    getAllPlayerInfo
};
