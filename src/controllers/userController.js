﻿const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function registerUser(req, res) {
    const { username, email, role, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const newUser = await pool.query(
            'INSERT INTO users (uuid, username, email, role, password, salt, rank, kda) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, 4, 0.0) RETURNING *',
            [username, email, role, hashedPassword, salt]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function loginUser(req, res) {
    const { email, password } = req.body;
    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign(
            { user_id: user.rows[0].uuid },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, uuid: user.rows[0].uuid });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function getUserAchievements(req, res) {
    const { userId } = req.params;
    try {
        const achievements = await pool.query(
            'SELECT * FROM user_achievements WHERE user_uuid = $1',
            [userId]
        );
        res.json(achievements.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}



module.exports = {
    registerUser,
    loginUser,
    getUserAchievements
};
