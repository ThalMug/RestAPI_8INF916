﻿const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const verifyJWT = require('../verifyJWT');

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
            {
                user_id: user.rows[0].uuid,
                role: user.rows[0].role
            },
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
    verifyJWT(req, res, async function () {
        const { userId, role } = req;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
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
    });
}

async function unlockUserAchievement(req, res) {
    const { user_uuid, achievement_id } = req.body;
    verifyJWT(req, res, async function () {
        const { userId, role } = req;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            const newUserAchievement = await pool.query(
                'INSERT INTO user_achievements (user_uuid, achievement_uuid) VALUES ($1, $2) RETURNING *',
                [user_uuid, achievement_id]
            );
            res.json(newUserAchievement.rows[0]);
        } catch (err) {
            console.error(JSON.stringify({
                message: "Error when interacting with the database",
                error: err.message,
                code: err.code
            }, null, 2));
            res.status(500).send('Server error');
        }
    });
}

module.exports = {
    registerUser,
    loginUser,
    getUserAchievements,
    unlockUserAchievement
};