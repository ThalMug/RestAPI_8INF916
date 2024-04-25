const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());

const redisClient = redis.createClient({
    url: 'redis://172.21.0.2:6379'
});

redisClient.connect();

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
