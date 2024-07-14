import redis from 'redis';

const redisClient = redis.createClient();

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

export default redisClient;
