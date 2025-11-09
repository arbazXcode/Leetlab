const express = require('express')
const app = express()
require('dotenv').config({ path: './src/.env' })
const authRouter = require('./routes/userAuth.js')
const problemRouter = require("./routes/problemCreator.js")
const dbConnect = require('./config/db.js')
const cookieParser = require('cookie-parser')
const redisClient = require('./config/redis.js')
const submitRouter = require("./routes/submit.js")
const port = process.env.PORT || 3000
const cors = require("cors")


// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // callback(error, allow) syntax of callback
        if (!origin) return callback(null, true);

        // Allow localhost on any port
        if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+$/)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Required if using cookies/sessions
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Routes
app.use('/user', authRouter)
app.use('/problem', problemRouter)
app.use('/submission', submitRouter)

const initializeConnection = async () => {
    try {
        await dbConnect()
        console.log('MongoDB connected.')
        try {
            if (redisClient && typeof redisClient.connect === 'function') {
                if (redisClient.isConfigured === false) {
                    console.warn('Redis is not configured. Skipping Redis connection.');
                } else {
                    await redisClient.connect()
                    console.log('Redis connected.')
                }
            } else {
                console.warn('Redis client does not expose a connect() method. Skipping Redis connection.');
            }
        } catch (redisErr) {
            console.error('Failed to connect to Redis (continuing without Redis):', redisErr)
        }

        app.listen(port, () => {
            console.log(`Server is listening at port number: ${port}`)
        })

    } catch (error) {
        console.error("Failed to initialize connections:", error)
        process.exit(1);
    }
}

initializeConnection()
