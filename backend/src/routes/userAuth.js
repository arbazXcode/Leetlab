const express = require('express');
const { register, login, logout, getProfile, adminRegister, deleteProfile } = require('../controllers/userAuthent.js');
const userMiddleware = require('../middleware/userMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');
const optionalUser = require("../middleware/optionalMiddlewares.js")


const authRouter = express.Router();


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
// authRouter.post('/getProfile', userMiddleware, getProfile);

authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile)
// Add the check endpoint that was missing in your code
authRouter.get("/check", optionalUser, (req, res) => {
    try {
        // If no user (not logged in)
        if (!req.user) {
            return res.status(200).json({
                user: null,
                message: "Not logged in"
            });
        }

        // When logged in
        const userData = {
            firstName: req.user.firstName,
            email: req.user.email,
            _id: req.user._id,
            role: req.user.role
        };

        return res.status(200).json({
            user: userData,
            message: "Valid user"
        });
    } catch (error) {
        return res.status(500).json({
            error: "Server error during authentication check"
        });
    }
});



authRouter.get('/me', adminMiddleware, (req, res) => {
    // req.user is attached by the middleware
    res.send(`Hello Admin: ${req.user.firstName}`);
});

module.exports = authRouter;
