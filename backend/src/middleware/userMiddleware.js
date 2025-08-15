const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis.js");
const User = require('../models/user.js');

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token not found. Please log in.");
        }

        // ✅ Check if token is blacklisted in Redis
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) {
            throw new Error("Token is blocked. Please log in again.");
        }

        // ✅ Verify token
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) {
            throw new Error("Invalid token payload.");
        }

        // ✅ Fetch user from DB
        const result = await User.findById(_id);
        if (!result) {
            throw new Error("User doesn't exist.");
        }

        // ✅ Attach user to request for next middleware/route
        req.result = result;

        next();
    } catch (error) {
        res.status(401).json({ error: "Authorization Error: " + error.message });
    }
};

module.exports = userMiddleware;
