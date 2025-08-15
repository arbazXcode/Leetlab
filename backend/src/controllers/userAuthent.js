const User = require('../models/user.js');
const validate = require('../utils/validator.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.js');
const Submission = require("../models/submission.js")

const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).send("Error: An account with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            ...req.body,
            password: hashedPassword,
            // role: "user"
        });
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        res.status(201).send("User registered successfully.");
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId || !password) throw new Error("Email and password are required.");

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("Invalid credentials.");

        const match = await bcrypt.compare(password, user.password);
        if (!match) throw new Error("Invalid credentials.");

        const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

        res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });

        res.status(200).send("Logged in successfully.");
    } catch (error) {
        res.status(401).send("Error: " + error.message);
    }
};

const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        // The userMiddleware already ensures a token exists, but this is a good safeguard.
        if (!token) return res.status(200).send("Already logged out.");

        const payload = jwt.decode(token);
        // Add token to a blocklist in Redis until it expires naturally.
        if (payload && payload.exp) {
            await redisClient.set(`token:${token}`, 'blocked', {
                EXAT: payload.exp
            });
        }

        // FIX: Must provide the same options used to set the cookie to clear it.
        // res.clearCookie('token', null, {expires: new Date(Date.now())});
        res.clearCookie('token', { httpOnly: true, path: '/' });

        res.status(200).send("Logged out successfully.");

    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
};

const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { emailId, password, role } = req.body;
        if (role && !['user', 'admin'].includes(role)) {
            throw new Error("Invalid role specified. Can be 'user' or 'admin'.");
        }
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).send("Error: An account with this email already exists.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            ...req.body,
            password: hashedPassword,
        });
        res.status(201).send("New user registered successfully by admin.");
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id

        await User.findByIdAndDelete(userId)

        // await Submission.deleteMany({ userId })
        res.status(200).send("deleted successfully")

    } catch (error) {
        res.status(500).send("server error")
    }
}

module.exports = { register, login, logout, adminRegister, deleteProfile };
