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
        res.json({user_id:newUser.rows[0], success: "register"});
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
            return res.status(401).json({ message: 'Email not found' , error:0 , context: "login"});
        }

        const isValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isValid) {
            return res.status(401).json({ message: 'Wrong password', error:1 , context: "login"});
        }

        const token = jwt.sign(
            {
                user_id: user.rows[0].uuid,
                role: user.rows[0].role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, uuid: user.rows[0].uuid,success:"login" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}

async function getUserAchievements(req, res) {
    verifyJWT(req, res, async function () {

        const userId = req.user_id;
        const role = req.role;

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

async function addFriend(req, res) {
    const { friend_username } = req.body;
    verifyJWT(req, res, async function () {
        const userId = req.user_id;
        const role = req.role;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            // Query the users table to find the user UUID associated with the friend's username
            const friendQuery = await pool.query(
                'SELECT uuid FROM users WHERE username = $1',
                [friend_username]
            );

            if (friendQuery.rows.length === 0) {
                return res.status(404).json({ message: 'Friend not found', error:0 , context: "friend" });
            }

            const friendUuid = friendQuery.rows[0].uuid;

            // Now you have both the user UUID and the friend UUID, proceed to add the friend
            const existingFriendship = await pool.query(
                'SELECT * FROM friends WHERE user_uuid = $1 AND friend_uuid = $2',
                [userId, friendUuid]
            );

            if (existingFriendship.rows.length > 0) {
                return res.status(400).json({ message: 'Friendship already exists' , error:1 , context: "friend"});
            }

            // Insert the new friendship
            await pool.query(
                'INSERT INTO friends (user_uuid, friend_uuid) VALUES ($1, $2)',
                [userId, friendUuid]
            );

            res.status(201).json({ message: 'Friend added successfully' , success: "friend"});
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });
}

async function getFriends(req, res) {
    verifyJWT(req, res, async function () {
        const userId = req.user_id;
        const role = req.role;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            // Query the friends table to get the UUIDs of the user's friends
            const friendUuids = await pool.query(
                'SELECT friend_uuid FROM friends WHERE user_uuid = $1',
                [userId]
            );

            // Extract the friend UUIDs from the result
            const friendUuidArray = friendUuids.rows.map(row => row.friend_uuid);

            // Query the users table to get the usernames corresponding to the friend UUIDs
            const friendsWithUsernames = await pool.query(
                'SELECT username FROM users WHERE uuid = ANY($1)',
                [friendUuidArray]
            );

            // Extract the usernames from the result
            const usernames = friendsWithUsernames.rows.map(row => row.username);

            console.log('User', userId, 'has friends:', usernames);

            // Send the usernames as the response
            res.json(usernames);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });

}

async function getFriends(req, res) {
    verifyJWT(req, res, async function () {
        const userId = req.user_id;
        const role = req.role;
        if (role != "client") {
            return res.status(403).json({ message: 'Forbidden' });
        }
        try {
            // Query the friends table to get the UUIDs of the user's friends
            const friendUuids = await pool.query(
                'SELECT friend_uuid FROM friends WHERE user_uuid = $1',
                [userId]
            );

            // Extract the friend UUIDs from the result
            const friendUuidArray = friendUuids.rows.map(row => row.friend_uuid);

            // Query the users table to get the usernames corresponding to the friend UUIDs
            const friendsWithUsernames = await pool.query(
                'SELECT username FROM users WHERE uuid = ANY($1)',
                [friendUuidArray]
            );

            // Extract the usernames from the result
            const usernames = friendsWithUsernames.rows.map(row => row.username);

            console.log('User', userId, 'has friends:', usernames);

            // Send the usernames as the response
            res.json(usernames);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });
}



module.exports = {
    registerUser,
    loginUser,
    getUserAchievements,
    addFriend,
    getFriends
};

