const Problem = require("../models/problems.js");
const User = require("../models/user.js");
const Submission = require("../models/submission.js");
const {
    getLanguageById,
    submitBatch,
    submitToken,
} = require("../utils/problemUtility.js");

/**
 * CREATE PROBLEM (ADMIN)
 */
const createProblem = async (req, res) => {
    try {
        const {
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
        } = req.body;

        // basic validation
        if (
            !title ||
            !description ||
            !difficulty ||
            !Array.isArray(visibleTestCases) ||
            !Array.isArray(hiddenTestCases) ||
            !Array.isArray(startCode) ||
            !Array.isArray(referenceSolution)
        ) {
            return res.status(400).json({ message: "Invalid payload" });
        }

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            tags,
            visibleTestCases,
            hiddenTestCases,
            startCode,
            referenceSolution,
            problemCreator: req.user._id,
        });

        return res.status(201).json({
            message: "Problem created successfully",
            problem,
        });
    } catch (error) {
        console.error("Create problem error:", error);
        return res.status(500).json({
            message: "Server error while creating problem",
            error: error.message,
        });
    }
};


/**
 * UPDATE PROBLEM (ADMIN)
 */
const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing problem id" });

        const updated = await Problem.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Problem not found" });

        return res.status(200).json({
            message: "Problem updated successfully",
            problem: updated,
        });
    } catch (error) {
        console.error("Update problem error:", error);
        return res.status(500).json({
            message: "Server error while updating problem",
            error: error.message,
        });
    }
};


/**
 * DELETE PROBLEM (ADMIN)
 */
const deleteProblem = async (req, res) => {
    try {
        const { pid } = req.params;

        const deleted = await Problem.findByIdAndDelete(pid);
        if (!deleted) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET PROBLEM BY ID
 */
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        res.status(200).json(problem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET ALL PROBLEMS
 */
const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).select(
            "_id title difficulty tags"
        );

        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET SOLVED PROBLEMS BY USER
 */
const solvedAllProblemByUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "problemSolved",
            select: "_id title difficulty tags",
        });

        res.status(200).json(user.problemSolved);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET SUBMISSIONS OF USER FOR A PROBLEM
 */
const submittedProblem = async (req, res) => {
    try {
        const submissions = await Submission.find({
            userId: req.user._id,
            problemId: req.params.pid,
        });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
    solvedAllProblemByUser,
    submittedProblem,
};
