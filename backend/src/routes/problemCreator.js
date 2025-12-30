const express = require("express");
const problemRouter = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware.js");
const userMiddleware = require("../middleware/userMiddleware.js");

const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
    solvedAllProblemByUser,
    submittedProblem
} = require("../controllers/userProblem.js");

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:pid", adminMiddleware, deleteProblem);

problemRouter.get("/getAllProblem", userMiddleware, getAllProblems);
problemRouter.get("/getProblemById/:id", userMiddleware, getProblemById);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);


module.exports = problemRouter;
