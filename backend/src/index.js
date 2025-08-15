const express = require('express')
const app = express()
require('dotenv').config()
const authRouter = require('./routes/userAuth.js')
const problemRouter = require("./routes/problemCreator.js")
const main = require('./config/db.js')
const cookieParser = require('cookie-parser')
const redisClient = require('./config/redis.js')
const submitRouter = require("./routes/submit.js")
const port = process.env.PORT || 4000


// Middlewares
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/user', authRouter)
app.use('/problem', problemRouter)
app.use("/submission", submitRouter)

const initializeConnection = async () => {
    try {
        // Connect to DB and Redis in parallel
        await Promise.all([main(), redisClient.connect()])
        console.log('✅ MongoDB and Redis connected.')

        app.listen(port, () => {
            console.log(`🚀 Server is listening at port number: ${port}`)
        })

    } catch (error) {
        console.error("❌ Failed to initialize connections:", error)
        process.exit(1); // Exit if essential connections fail
    }
}

initializeConnection()
