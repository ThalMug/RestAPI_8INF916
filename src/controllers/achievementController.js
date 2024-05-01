const { pool } = require('../config/db');
const hardcodedImageUrl = "https://example.com/image.jpg";  // Placeholder URL
const verifyJWT = require('../verifyJWT');


async function addAchievement(req, res) {
    console.log("Adding achievement")
    const { name, description } = req.body;
    try {
        const newAchievement = await pool.query(
            'INSERT INTO achievements (name, description, image) VALUES ($1, $2, $3) RETURNING *',
            [name, description, hardcodedImageUrl]
        );
        res.json(newAchievement.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function unlockAchievement(req, res) {
    console.log("Unlock achievement");
    const { user_uuid, achievement_id } = req.body;
    console.log("User: ", user_uuid);
    console.log("Achivement: ", achievement_id);
    verifyJWT(req, res, async function () {
        const userId = req.user_id;
        const role = req.role;
        if (role != "dedicated game server") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {

            // Assuming the achievement_uuid is the ID of an existing achievement
            const userAchievement = await pool.query(
                'INSERT INTO user_achievements (user_uuid, achievement_id) VALUES ($1, $2) RETURNING *',
                [user_uuid, achievement_id]
            );
            res.json(userAchievement.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });
}

async function getAchievement(req, res) {
    const { name } = req.params;
    try {
        const achievement = await pool.query(
            'SELECT * FROM achievements WHERE name = $1',
            [name]
        );
        res.status(200).json(achievement.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

module.exports = {
    addAchievement,
    getAchievement,
    unlockAchievement
};
