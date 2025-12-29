const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware.js");
const {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
    solvedAllProblemByUser,
    submittedProblem
} = require("../controllers/userProblem.js");
const userMiddleware = require("../middleware/userMiddleware.js");

// All routes in this file are for creating/managing problems, which should be an admin task.
// This middleware protects all subsequent routes in this file.
// problemRouter.use(adminMiddleware); 

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:pid", adminMiddleware, deleteProblem);



problemRouter.get("/getProblemById/:id", userMiddleware, getProblemById);
problemRouter.get("/getAllProblem", userMiddleware, getAllProblems);
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblemByUser);
problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem)
problemRouter.get("/:id", getProblemById);

module.exports = problemRouter;
