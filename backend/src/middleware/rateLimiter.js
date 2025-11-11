const { client: redisClient } = require("../config/redis.js")

const submissionRateLimiter = async (req, res, next) => {
    try {
        if (!redisClient || !redisClient.isOpen) {
            console.warn("Redis client not connected so skipping rate limit.");
            return next();
        }
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const redisKey = `submit_cooldown:${userId}`

        const exists = await redisClient.exists(redisKey)
        if (exists)
            return res.status(429).json({
                error: "Please wait 10 seconds before submitting again"
            })

        await redisClient.set(redisKey, 'cooldown_active', {
            EX: 10, //expire ker do after 10 seconds
            NX: true //onlyy set if not exists
        })

        next()
    } catch (error) {
        console.error("Rate Limiter error")
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

module.exports = submissionRateLimiter;