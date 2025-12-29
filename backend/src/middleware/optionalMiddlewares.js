const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
require('dotenv').config({ path: './src/.env' })

module.exports = async function (req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = await User.findById(decoded._id).select("-password");

        return next();
    } catch (err) {
        req.user = null;
        return next();
    }
};
