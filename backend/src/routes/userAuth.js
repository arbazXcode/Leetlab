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
authRouter.get("/check", userMiddleware, (req, res) => {
    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id
    }
    res.status(200).send({
        user: reply,
        message: "valid user"
    })
})


authRouter.get('/me', adminMiddleware, (req, res) => {
    // req.result is attached by the middleware
    res.send(`Hello Admin: ${req.result.firstName}`);
});

module.exports = authRouter;
