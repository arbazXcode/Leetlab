require('dotenv').config({ path: './src/.env' }); // Adjust path if .env is in root

const { createClient } = require('redis');

const { REDIS_HOST, REDIS_PORT, REDIS_PASS } = process.env;

const isConfigured = Boolean(REDIS_HOST && REDIS_PORT && REDIS_PASS);

if (!isConfigured) {
    console.warn('Redis configuration missing (REDIS_HOST/REDIS_PORT/REDIS_PASS). Skipping Redis setup.');
    module.exports = {
        isConfigured: false,
        connect: async () => { },
        client: null,
    };
    return;
}

// Create Redis client
const redisClient = createClient({
    username: 'default',
    password: REDIS_PASS,
    socket: {
        host: REDIS_HOST,
        port: Number(REDIS_PORT),
        reconnectStrategy: (retries) => {
            // Retry every 2s up to 10 times
            if (retries > 10) {
                console.error('Redis: too many reconnect attempts. Giving up.');
                return new Error('Retry limit reached');
            }
            console.log(`Redis reconnect attempt #${retries}`);
            return 2000;
        },
    },
});

// Handle connection errors
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

// Log when connected
redisClient.on('connect', () => {
    console.log('Redis client connected.');
});

redisClient.on('ready', () => {
    console.log('Redis is ready for use.');
});

// Log disconnection
redisClient.on('end', () => {
    console.log('Redis connection closed.');
});

// Graceful shutdown for production
process.on('SIGINT', async () => {
    console.log('Closing Redis connection...');
    await redisClient.quit();
    process.exit(0);
});

// Export a consistent object
module.exports = {
    isConfigured: true,
    connect: async () => {
        try {
            await redisClient.connect();
        } catch (err) {
            console.error('Failed to connect to Redis:', err.message);
        }
    },
    client: redisClient,
};


















// require('dotenv').config({ path: '../src/.env' });

// const { createClient } = require('redis');


// const isConfigured = Boolean(process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASS);

// if (!isConfigured) {
//     // Export a safe, minimal stub so requiring this module won't throw when Redis is optional.
//     console.warn('Redis is not configured (missing REDIS_HOST/REDIS_PORT/REDIS_PASS). Skipping Redis connection.');
//     module.exports = {
//         isConfigured: false,
//         connect: async () => { },
//         // Minimal event handler stub so callers can still attach listeners safely.
//         on: () => { },
//     };
// } else {
//     const redisClient = createClient({
//         username: "default",
//         password: process.env.REDIS_PASS,
//         socket: {
//             host: process.env.REDIS_HOST,
//             port: parseInt(process.env.REDIS_PORT, 10)
//         }
//     });

//     redisClient.on('error', err => console.error('Redis Client Error', err));

//     // Export an object with a connect method and the raw client if callers need it.
//     module.exports = {
//         isConfigured: true,
//         connect: redisClient.connect.bind(redisClient),
//         client: redisClient,
//         on: redisClient.on.bind(redisClient),
//         get: redisClient.get ? redisClient.get.bind(redisClient) : undefined,
//         set: redisClient.set ? redisClient.set.bind(redisClient) : undefined,
//     };
// }

// // import { createClient } from 'redis';

// // const client = createClient({
// //     username: 'default',
// //     password: 'skQa0rMNfBTFzSZNCSj5IXGAMI262hay',
// //     socket: {
// //         host: 'redis-16398.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
// //         port: 16398
// //     }
// // });

// // client.on('error', err => console.log('Redis Client Error', err));

// // await client.connect();

// // await client.set('foo', 'bar');
// // const result = await client.get('foo');
// // console.log(result)  // >>> bar