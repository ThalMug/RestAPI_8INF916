const express = require('express');
require('dotenv').config();
const { redisClient } = require('./config/redis');
const { pool, createTables } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const serverRoutes = require('./routes/serverRoutes');
const matchmakingRoutes = require('./routes/matchmakingRoutes');

const app = express();
app.use(express.json());

// Redis error handling
redisClient.on('error', (err) => console.log('Redis Client Error', err));

createTables();


// Register routes
app.use('/users', userRoutes);
app.use('/achievements', achievementRoutes);
app.use('/servers', serverRoutes);
app.use('/matchmaking', matchmakingRoutes);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
