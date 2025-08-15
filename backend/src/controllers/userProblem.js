
const Problem = require("../models/problems.js");
const User = require("../models/user.js");
const { findById } = require("../models/user.js");
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility.js');

const createProblem = async (req, res) => {

    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode
        , problemCreator, referenceSolution
    } = req.body

    try {

        for (const { language, completeCode } of referenceSolution) {
            //source code
            //languageId
            //stdin:
            //expected_output;
            const languageId = getLanguageById(language)

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }))

            const submitResult = await submitBatch(submissions)
            const resultToken = submitResult.map((value) => value.token)

            const testResult = await submitToken(resultToken)
            // console.log(testResult);

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error occurred")
                }
            }
        }


        //we can store it in our DB
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })

        res.status(201).json({
            message: "Problem created successfully",
            problem: req.body
        });

    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};


const updateProblem = async (req, res) => {
    const { id } = req.params

    try {
        if (!id)
            return res.status(400).send("Missing Id")

        const dsaProblem = await Problem.findById(id)
        if (!dsaProblem)
            return res.status(404).send("Id is not present in server")
        const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode
            , problemCreator, referenceSolution
        } = req.body

        for (const { language, completeCode } of referenceSolution) {
            //source code
            //languageId
            //stdin:
            //expected_output;
            const languageId = getLanguageById(language)

            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }))

            const submitResult = await submitBatch(submissions)
            const resultToken = submitResult.map((value) => value.token)

            const testResult = await submitToken(resultToken)

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error occurred")
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true })
        res.status(200).send(newProblem)
    } catch (error) {
        res.status(500).send("Error" + error)
    }
};

const deleteProblem = async (req, res) => {
    const { id } = req.params

    try {
        if (!id)
            return res.status(400).send("id missing")

        const deletedProblem = await Problem.findByIdAndDelete(id)

        if (!deletedProblem)
            return res.status(404).send("problem is missing")

        res.status(200).send("SuccessFully deleted")
    } catch (error) {
        return res.status(500).send("Error" + error)
    }
};

const getProblemById = async (req, res) => {
    const { id } = req.params

    try {
        if (!id)
            return res.status(400).send("id missing")

        const getProblem = await Problem.findById(id).select("_id title description difficulty tags visibleTestCases startCode referenceSolution")

        if (!getProblem)
            return res.status(404).send("problem is missing")

        res.status(200).send(getProblem)
    } catch (error) {
        return res.status(500).send("Error" + error)
    }
};

const getAllProblems = async (req, res) => {

    try {

        const getProblem = await Problem.find({}).select("_id title tags difficulty")

        if (getProblem.length == 0)
            return res.status(404).send("problem is missing")

        res.status(200).send(getProblem)
    } catch (error) {
        return res.status(500).send("Error" + error)
    }
};

const solvedAllProblemByUser = async (req, res) => {
    try {
        const userId = req.result._id
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        })
        res.status(200).send(user.problemSolved)

    } catch (error) {
        res.status(500).send("Server error")
    }
}

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id
        const problemId = req.params.pid

        const ans = await Submission.find({ userId, problemId })

        if (ans.length == 0) {
            res.status(200).send("no submission present")
        }

        res.status(200).send(ans)
    } catch (error) {
        res.status(500).send("internal server error")
    }
}

module.exports = {
    createProblem,
    updateProblem,
    deleteProblem,
    getProblemById,
    getAllProblems,
    solvedAllProblemByUser,
    submittedProblem
};
