const express = require("express")
const userMiddleware = require("../middleware/userMiddleware.js")
const { submitCode, runcode } = require("../controllers/userSubmission.js")
// const submissionRateLimiter = require("../middleware/rateLimiter.js");

const submitRouter = express.Router()

submitRouter.post("/submit/:id", userMiddleware, submitCode)
submitRouter.post("/run/:id", userMiddleware, runcode)

module.exports = submitRouter