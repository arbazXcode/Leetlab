const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const redisClient = require('../config/redis.js');

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                error: "Authorization Error: Token not found"
            });
        }

        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            return res.status(401).json({
                error: "Authorization Error: Session expired"
            });
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(payload._id).select('-password');

        if (!user) {
            return res.status(401).json({
                error: "Authorization Error: User not found"
            });
        }

        req.user = user; // Standardize to req.user instead of req.result
        next();
    } catch (error) {
        console.error("Middleware error:", error);
        return res.status(401).json({
            error: `Authorization Error: ${error.message}`
        });
    }
};

module.exports = userMiddleware;