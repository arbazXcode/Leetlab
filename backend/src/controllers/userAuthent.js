const User = require("../models/user.js")
const validate = require('../utils/validator.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis.js');
// const Submission = require("../models/submission.js")


// const register = async (req, res) => {
//     try {
//         validate(req.body);
//         const { firstName, email, password } = req.body;

//         if (!firstName || !email || !password) {
//             return res.status(400).send("Error: Missing required fields");
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(409).send("Error: An account with this email already exists.");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = await User.create({
//             firstName,
//             email,
//             password: hashedPassword,
//             role: 'user'
//         });

//         const reply = {
//             firstName: user.firstName,
//             email: user.email,
//             _id: user._id
//         };

//         res.status(201).json({
//             user: reply,
//             message: "User registered successfully"
//         });

//     } catch (error) {
//         res.status(400).send("Error: " + error.message);
//     }
// };

// ---------------- REGISTER ----------------
const register = async (req, res) => {
    try {
        // Validate body
        const { firstName, email, password } = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json({ message: "An account with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            email,
            password: hashedPassword,
            role: "user",
        });

        // Create JWT Token
        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        // Send token in cookie (optional but good practice)
        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000, // 1 hour
            httpOnly: true,
            sameSite: "lax",
            secure: false, // true only if using HTTPS
        });

        // Clean user object for response
        const reply = {
            firstName: user.firstName,
            email: user.email,
            _id: user._id,
            role: user.role
        };

        //Send token + user back in response
        res.status(201).json({
            message: "User registered successfully",
            user: reply,
            token, // <-- added token here
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error.message);
        res.status(500).json({ message: "Error: " + error.message });
    }
};

// ---------------- LOGIN ----------------
// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) throw new Error("Email and password are required.");

//         const user = await User.findOne({ email });
//         if (!user) throw new Error("Invalid credentials.");

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) throw new Error("Invalid credentials.");

//         const reply = {
//             firstName: user.firstName,
//             email: user.email,
//             _id: user._id
//         };

//         const token = jwt.sign(
//             { _id: user._id, email: user.email, role: user.role },
//             process.env.JWT_KEY,
//             { expiresIn: '1h' }
//         );

//         res.cookie('token', token, {
//             maxAge: 60 * 60 * 1000,
//             httpOnly: true,
//             sameSite: 'lax',
//             secure: false
//         });

//         res.status(200).json({
//             user: reply,
//             message: "Logged in successfully."
//         });
//     } catch (error) {
//         res.status(401).send("Error: " + error.message);
//     }
// };

// ---------------- LOGIN ----------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: false, //true kr do production me
            path: "/"
        });

        const reply = {
            firstName: user.firstName,
            email: user.email,
            _id: user._id,
            role: user.role
        };

        res.status(200).json({
            message: "Logged in successfully",
            user: reply,
            token, // send token to frontend
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error.message);
        res.status(401).json({ message: "Error: " + error.message });
    }
};
// ---------------- LOGOUT ----------------
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.status(200).send("Already logged out.");

        const payload = jwt.decode(token);
        if (payload && payload.exp) {
            await redisClient.client.set(`token:${token}`, 'blocked', {
                EXAT: payload.exp
            });
        }

        res.clearCookie('token', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: false
        });

        res.status(200).send("Logged out successfully.");
    } catch (error) {
        res.status(500).send("Error: " + error.message);
    }
};

// ---------------- ADMIN REGISTER ----------------
// const adminRegister = async (req, res) => {
//     try {
//         validate(req.body);
//         const { email, password, role } = req.body;
//         if (role && !['user', 'admin'].includes(role)) {
//             throw new Error("Invalid role specified. Can be 'user' or 'admin'.");
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(409).send("Error: An account with this email already exists.");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         await User.create({
//             ...req.body,
//             password: hashedPassword,
//         });

//         res.status(201).send("New user registered successfully by admin.");
//     } catch (error) {
//         res.status(400).send("Error: " + error.message);
//     }
// };

const adminRegister = async (req, res) => {
    try {
        const { firstName, email, password, role } = req.body;

        // Basic validation
        if (!firstName || !email || !password) {
            return res.status(400).json({ error: "First name, email, and password are required." });
        }
        //if admin koin role ni bhejta, default role user kar do.
        const finalRole = role && ['user', 'admin'].includes(role) ? role : 'user'

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Account with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user/admin
        const newUser = await User.create({
            firstName,
            email,
            password: hashedPassword,
            role: finalRole
        });

        res.status(201).json({
            message: `New ${finalRole} registered successfully by admin.`,
            user: {
                _id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Admin Register Error:", error.message);
        res.status(500).json({ error: "Error: " + error.message });
    }
};



// ---------------- DELETE PROFILE ----------------
const deleteProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndDelete(userId);
        // await Submission.deleteMany({ userId })
        res.status(200).send("Deleted successfully");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };































// const User = require('../models/user.js');
// const validate = require('../utils/validator.js');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const redisClient = require('../config/redis.js');
// const Submission = require("../models/submission.js")

// // const register = async (req, res) => {
// //     try {
// //         validate(req.body);
// //         const { firstName, email, password } = req.body;
// //         if (!firstName || !email || !password) {
// //             return res.status(400).send("Error: Missing required fields");
// //         }

// //         const existingUser = await User.findOne({ email });
// //         if (existingUser) {
// //             return res.status(409).send("Error: An account with this email already exists.");
// //         }
// //         const hashedPassword = await bcrypt.hash(password, 10);
// //         const user = await User.create({
// //             ...req.body,
// //             password: hashedPassword,
// //             // role: "user"
// //         });
// //         const token = jwt.sign({ _id: user._id, emailId: email, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

// //         const reply = {
// //             firstName: user.firstName,
// //             emailId: user.email,
// //             _id: user._id
// //         }
// //         res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });

// //         res.status(201).json({
// //             user: reply,
// //             message: "User registered successfully"
// //         })
// //     } catch (error) {
// //         res.status(400).send("Error: " + error.message);
// //     }
// // };


// const register = async (req, res) => {
//     try {
//         validate(req.body);
//         const { firstName, email, password } = req.body;

//         if (!firstName || !email || !password) {
//             return res.status(400).send("Error: Missing required fields");
//         }

//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(409).send("Error: An account with this email already exists.");
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = await User.create({
//             ...req.body,
//             password: hashedPassword
//         });

//         const token = jwt.sign(
//             { _id: user._id, email: user.email, role: user.role },
//             process.env.JWT_KEY,
//             { expiresIn: '1h' }
//         );

//         const reply = {
//             firstName: user.firstName,
//             email: user.email,
//             _id: user._id
//         };

//         res.cookie('token', token, {
//             maxAge: 60 * 60 * 1000,
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict"
//         });

//         res.status(201).json({
//             user: reply,
//             message: "User registered successfully"
//         });

//     } catch (error) {
//         res.status(400).send("Error: " + error.message);
//     }
// };

// const login = async (req, res) => {
//     try {
//         const { emailId, password } = req.body;
//         if (!emailId || !password) throw new Error("Email and password are required.");

//         const user = await User.findOne({ emailId });
//         if (!user) throw new Error("Invalid credentials.");

//         const match = await bcrypt.compare(password, user.password);
//         if (!match) throw new Error("Invalid credentials.");

//         const reply = {
//             firstName: user.firstName,
//             emailId: user.emailId,
//             _id: user._id
//         }

//         const token = jwt.sign({ _id: user._id, emailId: user.emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: '1h' });

//         res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true });

//         res.status(201).json({
//             user: reply,
//             message: "Logged in successfully."
//         })
//     } catch (error) {
//         res.status(401).send("Error: " + error.message);
//     }
// };

// const logout = async (req, res) => {
//     try {
//         const { token } = req.cookies;
//         // The userMiddleware already ensures a token exists, but this is a good safeguard.
//         if (!token) return res.status(200).send("Already logged out.");

//         const payload = jwt.decode(token);
//         // Add token to a blocklist in Redis until it expires naturally.
//         if (payload && payload.exp) {
//             await redisClient.set(`token:${token}`, 'blocked', {
//                 EXAT: payload.exp
//             });
//         }

//         // FIX: Must provide the same options used to set the cookie to clear it.
//         // res.clearCookie('token', null, {expires: new Date(Date.now())});
//         res.clearCookie('token', { httpOnly: true, path: '/' });

//         res.status(200).send("Logged out successfully.");

//     } catch (error) {
//         res.status(500).send("Error: " + error.message);
//     }
// };

// const adminRegister = async (req, res) => {
//     try {
//         validate(req.body);
//         const { emailId, password, role } = req.body;
//         if (role && !['user', 'admin'].includes(role)) {
//             throw new Error("Invalid role specified. Can be 'user' or 'admin'.");
//         }
//         const existingUser = await User.findOne({ emailId });
//         if (existingUser) {
//             return res.status(409).send("Error: An account with this email already exists.");
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         await User.create({
//             ...req.body,
//             password: hashedPassword,
//         });
//         res.status(201).send("New user registered successfully by admin.");
//     } catch (error) {
//         res.status(400).send("Error: " + error.message);
//     }
// };

// const deleteProfile = async (req, res) => {
//     try {
//         const userId = req.result._id

//         await User.findByIdAndDelete(userId)

//         // await Submission.deleteMany({ userId })
//         res.status(200).send("deleted successfully")

//     } catch (error) {
//         res.status(500).send("server error")
//     }
// }

// module.exports = { register, login, logout, adminRegister, deleteProfile };
