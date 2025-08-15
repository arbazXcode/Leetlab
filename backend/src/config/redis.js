
const { createClient } = require('redis');

if (!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASS) {
    throw new Error("Redis credentials are not fully defined in .env file");
}

const redisClient = createClient({
    username: "default",
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10)
    }
});

redisClient.on('error', err => console.error('Redis Client Error', err));

module.exports = redisClient;

// import { createClient } from 'redis';

// const client = createClient({
//     username: 'default',
//     password: 'skQa0rMNfBTFzSZNCSj5IXGAMI262hay',
//     socket: {
//         host: 'redis-16398.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 16398
//     }
// });

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar