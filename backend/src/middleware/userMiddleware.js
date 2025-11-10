const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.js');
const User = require('../models/user.js');

const userMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const isBlocked = await redisClient.client.get(`token:${token}`);
        if (isBlocked) return res.status(403).json({ error: 'Token is blocked' });

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const user = await User.findById(decoded._id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: `Authorization Error: ${err.message}` });
    }
};

module.exports = userMiddleware;
