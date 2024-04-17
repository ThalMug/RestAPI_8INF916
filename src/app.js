const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const newUser = await pool.query(
            'INSERT INTO users (uuid, username, email, password, salt) VALUES (uuid_generate_v4(), $1, $2, $3, $4) RETURNING *',
            [username, email, hashedPassword, salt]
        );
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

        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// A Protected route, where you have to log in to continue
// If you're already login, you can use your JWT token to access this route
app.get('/protected', (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            //console.log("User is forbidden from accessing this endpoint")
            return res.sendStatus(403);
        }

        req.user = user;
        res.json({ message: 'This is a protected endpoint', user: req.user });
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
