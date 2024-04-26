const { pool } = require('../config/db');
const hardcodedImageUrl = "https://example.com/image.jpg";  // Placeholder URL

async function addAchievement(req, res) {
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
    getAchievement
};
