const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const redisClient = require("../config/redis.js");

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            throw new Error("Token not found. Please log in.");
        }

        const isBlocked = await redisClient.client.get(`token:${token}`);
        if (isBlocked == 'blocked') {
            throw new Error("Token is blocked. Please log in again.");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        if (!payload || payload.role !== "admin") {
            throw new Error("Access denied. Admin privileges required.");
        }

        const admin = await User.findById(payload._id);
        if (!admin) {
            throw new Error("Admin user not found.");
        }

        req.user = admin; // Attach admin user info to the request object
        next();

    } catch (error) {
        res.status(401).send("Authorization Error: " + error.message);
    }
};

module.exports = adminMiddleware;
