const express = require('express')
const app = express()
require('dotenv').config({ path: './src/.env' })
const authRouter = require('./routes/userAuth.js')
const problemRouter = require("./routes/problemCreator.js")
const dbConnect = require('./config/db.js')
const cookieParser = require('cookie-parser')
const { client: redisClient, connect: connectRedis, isConfigured } = require('./config/redis.js');
const submitRouter = require("./routes/submit.js")
const port = process.env.PORT || 3000
const cors = require("cors")
const mongoose = require("mongoose")


// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,               // allow cookies / tokens
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/user', authRouter)
app.use('/problem', problemRouter)
app.use('/submission', submitRouter)

app.get('/health', async (req, res) => {
    try {
        const mongoStatus = mongoose.connection?.readyState === 1 ? 'connected' : 'disconnected';
        let redisStatus = 'not configured';

        if (isConfigured) {
            await connectRedis();
            const pong = await redisClient.ping();
            redisStatus = pong;
        }

        res.status(200).json({ status: 'OK', mongo: mongoStatus, redis: redisStatus });
    } catch (e) {
        res.status(500).json({ status: 'FAIL', message: e.message });
    }
});

const initializeConnection = async () => {
    try {
        await dbConnect()
        try {
            if (redisClient && typeof redisClient.connect === 'function') {
                if (redisClient.isConfigured === false) {
                    console.warn('Redis is not configured. Skipping Redis connection.');
                } else {
                    await redisClient.connect()
                }
            } else {
                console.warn('Redis client does not expose a connect() method. Skipping Redis connection.');
            }
        } catch (redisErr) {
            console.error('Failed to connect to Redis (continuing without Redis):', redisErr)
        }

        app.listen(port, () => {
            console.log(`server is running on ${process.env.PORT}`)
        })

    } catch (error) {
        console.error("Failed to initialize connections:", error)
        process.exit(1);
    }
}

initializeConnection()
