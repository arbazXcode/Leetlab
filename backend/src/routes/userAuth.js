const express = require('express');
const { register, login, logout, adminRegister, deleteProfile } = require('../controllers/userAuthent.js');
const userMiddleware = require('../middleware/userMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

const authRouter = express.Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
// authRouter.get('/getProfile', getProfile)

// User-protected routes
authRouter.post('/logout', userMiddleware, logout);

// Admin-protected routes
// FIX: The adminMiddleware is now active to secure this route.
// Only a logged-in admin can create another user/admin.
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete("/deleteprofile", userMiddleware, deleteProfile)

// Example admin-only test route
authRouter.get('/me', adminMiddleware, (req, res) => {
    // req.result is attached by the middleware
    res.send(`Hello Admin: ${req.result.firstName}`);
});

module.exports = authRouter;
