const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const redis = require('redis');
const hardcodedImageUrl = "https://www.google.com/imgres?q=achievement&imgurl=https%3A%2F%2Folc-wordpress-assets.s3.amazonaws.com%2Fuploads%2F2021%2F04%2FOLC-Awards-Thumbnail-1200x800.jpg&imgrefurl=https%3A%2F%2Fonlinelearningconsortium.org%2Fabout%2Folj-outstanding-achievement-award-online-education%2F&docid=6bNM2VMhzvQ5vM&tbnid=AbZ0CqbHti5kVM&vet=12ahUKEwim-5iZ1NiFAxV3D1kFHRBJBksQM3oFCIQBEAA..i&w=1200&h=800&hcb=2&ved=2ahUKEwim-5iZ1NiFAxV3D1kFHRBJBksQM3oFCIQBEAA";

require('dotenv').config();
const app = express();
app.use(express.json());

const redisClient = redis.createClient({
    url: 'redis://172.21.0.2:6379'
});

redisClient.connect();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.post('/register', async (req, res) => {
    const { username, email, role, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    console.log(username, email, role);
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const newUser = await pool.query(
            'INSERT INTO users (uuid, username, email, role, password, salt) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5) RETURNING *',
            [username, email, role, hashedPassword, salt]
        );
        console.log(username);
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(JSON.stringify({
            message: "Erreur lors du contact avec la base de données",
            error: err.message,
            code: err.code
        }, null, 2));
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
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
});

// A Protected route, where you have to log in to continue
// If you're already login, you can use your JWT token to access this route
app.get('/protected', (req, res) => {
    const token = req.headers['authorization'];

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            //console.log("User is forbidden from accessing this endpoint")
            //Send a res status of 403 and a message
            return res.status(403).json({ message: 'You\'re forbidden from accessing this endpoint, pls connect beforehand' });
        }

        //Get the user associated in the database with the token
        console.log(user.user_id)
        const dbUser = await pool.query('SELECT * FROM users WHERE uuid = $1', [user.user_id]);
        console.log(dbUser.rows[0].username)


        res.json({ message: 'welcome ' + dbUser.rows[0].username});
    });
});

//Add a route to /achievements/add
app.post('/achievements/add', async (req, res) => {
    const { name, description } = req.body;

    try {
        // Insert a new achievement into the achievements table
        const newAchievement = await pool.query(
            'INSERT INTO achievements (name, description, image) VALUES ($1, $2, $3) RETURNING *',
            [name, description, hardcodedImageUrl]
        );
        res.json(newAchievement.rows[0]);
    } catch (err) {
        console.error(JSON.stringify({
            message: "Error contacting the database",
            error: err.message,
            code: err.code
        }, null, 2));
        res.status(500).send('Server error');
    }
});

app.get('/achievements/get/:name', (req, res) => {
    const { name } = req.params;
    pool.query('SELECT * FROM achievements WHERE name = $1', [name], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows[0].image_url);
    });
});

//Genère une requête pour récupérer une image
app.get('/images/:url', (req, res) => {
    const { url } = req.params;
    res.sendFile(path.dirname(__dirname) + '/images/' + url);
});



app.post('/user/achievements/unlock', async (req, res) => {
    const { user_uuid, achievement_id } = req.body;
    console.log(achievement_id);
    try {
        const newUserAchievement = await pool.query(
            'INSERT INTO user_achievements (user_uuid, achievement_uuid) VALUES ($1, $2) RETURNING *',
            [user_uuid, achievement_id]
        );
        res.json(newUserAchievement.rows[0]);
    } catch (err) {
        console.error(JSON.stringify({
            message: "Erreur lors du contact avec la base de données",
            error: err.message,
            code: err.code
        }, null, 2));
        res.status(500).send('Server error');
    }
});

app.post('/server/register', async (req, res) => {
    const { ip_address } = req.body;

    try {
        const newServer = await pool.query(
            'INSERT INTO dedicated_server (server_id, ip_address) VALUES (uuid_generate_v4(), $1) RETURNING *',
            [ip_address]
        );

        res.status(200).json(newServer.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/server/create-session', async (req, res) => {
    const { serverIp } = req.body;

    try {
        await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());

        res.status(200).json({ message: 'Server session created.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



app.post('/server/add-player', async (req, res) => {
    const { serverIp, playerUuid } = req.body;

    const serverSessionKey = `server:1:${serverIp}`;

    try {
        await redisClient.sAdd(serverSessionKey, playerUuid);

        await redisClient.hSet(`server-info:${serverIp}`, 'lastUpdated', Date.now());

        res.status(200).json({ message: 'Player added to server session.' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});



app.get('/matchmaking', async (req, res) => {
    const {serverIp} = req.body;
    
    
});



app.listen(3000, () => console.log('Server running on port 3000'));