const redisClient = require("./redisClient")

const submitCodeRateLimitter = async (req, res, next) => {
    const userId = req.result._id
    const redisKey = `submit_cooldown:${userId}`

    try {
        const exists = await redisClient.exists(redisKey)

        if (exists) {
            return res.status(429).json({
                error: "Please wait 10 seconds before submitting again"
            })
        }

        await redisClient.set(redisKey, 'cooldown_active', {
            EX: 10,
            NX: true
        })

        next()
    } catch (error) {
        console.error("Rate Limiter error:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = submitCodeRateLimitter