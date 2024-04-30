const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://172.19.0.2:6379'
});
redisClient.connect();

module.exports = { redisClient };
