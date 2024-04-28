/*

- Get all server ips from dedicated_server table
- For each server ip, get all player infos from the session 
- compute the average rank and kda for each server
- return the server with the lowest gap between the average rank and kda and the player's rank and kda
 */
const { pool } = require('../config/db');
const { redisClient } = require('../config/redis');
const verifyJWT = require('../verifyJWT');



async function getServerWithBestRankAndKda(req, res) {
    verifyJWT(req, res, async function () {
        const { playerUuid, role } = req;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
    try {
        const serverIps = await pool.query('SELECT ip_address FROM dedicated_server');
        let bestServer = serverIps.rows[0].ip_address;
        let bestGap = Number.MAX_SAFE_INTEGER;

        for (const { ip_address } of serverIps.rows) {
            const serverSessionKey = `session:${ip_address}`;
            let players = await redisClient.sMembers(serverSessionKey);
            let index = players.indexOf("init");
            players.splice(index, 1);
            let totalRank = 0;
            let totalKda = 0;

            for (const player of players) {
                const playerKey = `player:${player}`;
                const playerData = await redisClient.hGetAll(playerKey);
                totalRank += parseInt(playerData.rank);
                totalKda += parseFloat(playerData.kDa);
            }

            const averageRank = totalRank / players.length;
            const averageKda = totalKda / players.length;

            const playerData = await pool.query('SELECT rank, kda FROM users WHERE uuid = $1', [playerUuid]);
            const playerRank = playerData.rows[0].rank;
            const playerKda = playerData.rows[0].kda;

            const rankGap = Math.abs(averageRank - playerRank);
            const kdaGap = Math.abs(averageKda - playerKda);

            if (rankGap + kdaGap < bestGap) {
                bestGap = rankGap + kdaGap;
                bestServer = ip_address;
            }
        }
        console.log('Best server:', bestServer);
        res.json({ ip_address: bestServer });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
}

module.exports = { getServerWithBestRankAndKda };