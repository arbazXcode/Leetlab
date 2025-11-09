const express = require('express');
const { register, login, logout, adminRegister, deleteProfile } = require('../controllers/userAuthent.js');
const userMiddleware = require('../middleware/userMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

const authRouter = express.Router();


authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);

authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete("/deleteprofile", userMiddleware, deleteProfile)
// Add the check endpoint that was missing in your code
authRouter.get("/check", userMiddleware, (req, res) => {
    try {
        const userData = {
            firstName: req.user.firstName,
            email: req.user.email,
            _id: req.user._id
        };

        res.status(200).json({
            user: userData,
            message: "Valid user"
        });
    } catch (error) {
        res.status(500).json({
            error: "Server error during authentication check"
        });
    }
});


authRouter.get('/me', adminMiddleware, (req, res) => {
    // req.result is attached by the middleware
    res.send(`Hello Admin: ${req.result.firstName}`);
});

module.exports = authRouter;
