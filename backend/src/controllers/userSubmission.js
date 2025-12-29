
const Problem = require("../models/problems.js")
const Submission = require("../models/submission.js")
const User = require("../models/user.js")
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility.js")



const submitCode = async (req, res) => {
    try {
        const userId = req.user._id
        const problemId = req.params.id

        const { code, language } = req.body

        if (!userId || !code || !problemId || !language)
            return res.status(400).send("some field missing - from usersubmission.js")

        const problem = await Problem.findById(problemId)

        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length
        })

        //judge0 ko code submit krna hai
        const languageId = getLanguageById(language)

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output
        }))

        const submitResult = await submitBatch(submissions)

        const resultToken = submitResult.map((value) => value.token)
        const testResult = await submitToken(resultToken)

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time)
                memory = Math.max(memory, test.memory

                )
            } else {
                if (test.status_id == 4) {
                    status = "error"
                    errorMessage = test.stderr
                } else {
                    status = "wrong"
                    errorMessage = test.stderr
                }
            }
        }

        submittedResult.status = status
        submittedResult.testCasesPassed = testCasesPassed
        submittedResult.errorMessage = errorMessage
        submittedResult.runtime = runtime
        submittedResult.memory = memory

        await submittedResult.save()
        const user = await User.findById(userId);

        if (!user.problemSolved.includes(problemId)) {
            user.problemSolved.push(problemId)
            await user.save()
        }


        res.status(201).send(submittedResult)

    } catch (error) {
        res.status(500).send("Internal server error" + error)
    }
}

// const runcode = async (req, res) => {
//     try {
//         const userId = req.user._id
//         const problemId = req.params.id

//         const { code, language } = req.body

//         if (!userId || !code || !problemId || !language)
//             return res.status(400).send("some field missing - from usersubmission.js")

//         const problem = await Problem.findById(problemId)

//         //judge0 ko code submit krna hai
//         const languageId = getLanguageById(language)

//         const submissions = problem.visibleTestCases.map((testcase) => ({
//             source_code: code,
//             language_id: languageId,
//             stdin: testcase.input,
//             expected_output: testcase.output
//         }))

//         const submitResult = await submitBatch(submissions)

//         const resultToken = submitResult.map((value) => value.token)
//         const testResult = await submitToken(resultToken)

//         res.status(201).send(testResult)

//     } catch (error) {
//         res.status(500).send("Internal server error" + error)
//     }
// }
const runcode = async (req, res) => {
    try {
        const userId = req.user?._id; // allow public run
        const problemId = req.params.id;

        const { code, language, stdin } = req.body;

        if (!code || !problemId || !language)
            return res.status(400).send("Missing fields");

        const problem = await Problem.findById(problemId);
        const languageId = getLanguageById(language);

        // ✅ Detect custom input run
        if (stdin) {
            const submitResult = await submitBatch([
                {
                    source_code: code,
                    language_id: languageId,
                    stdin,
                },
            ]);

            const token = submitResult[0].token;
            const [result] = await submitToken([token]);

            return res.status(200).json(result);
        }

        // ✅ Normal visible testcases execution
        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        return res.status(201).send(testResult);
    } catch (error) {
        res.status(500).send("Internal server error: " + error.message);
    }
};



module.exports = { submitCode, runcode }



// language_id: 63,
//     stdin: '-1 5',
//     expected_output: '4',
//     stdout: '4\n',
//     status_id: 3,
//     created_at: '2025-08-14T17:37:47.785Z',
//     finished_at: '2025-08-14T17:37:48.109Z',
//     time: '0.026',
//     memory: 7836,
//     stderr: null,
//     token: '36d1240e-6678-4f47-ab31-6763aefe5cdf',