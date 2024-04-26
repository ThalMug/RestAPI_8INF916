const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});
redisClient.connect();

module.exports = { redisClient };
