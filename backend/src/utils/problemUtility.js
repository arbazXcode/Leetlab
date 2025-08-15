const axios = require("axios");

const getLanguageById = (lang) => {
    const languages = {
        "c++": 54,
        "java": 62,
        "javascript": 63,
        "python": 71
    };
    return languages[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
    const options = {
        method: 'POST',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: { base64_encoded: 'false' },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST,
            'Content-Type': 'application/json'
        },
        data: { submissions }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (error) {
            console.error("Axios error in submitBatch:", error.response ? error.response.data : error.message);
            throw new Error("Failed to submit batch to Judge0.");
        }
    }
    return await fetchData();
};


const waiting = async (timer) => {
    setTimeout(() => {
        return 1;
    }, timer)
}

const submitToken = async (resultTokens) => {
    const tokens = resultTokens.join(",");
    const options = {
        method: 'GET',
        url: `https://${process.env.RAPIDAPI_HOST}/submissions/batch`,
        params: {
            tokens: resultTokens.join(","),
            base64_encoded: 'false',
            fields: 'source_code,language_id,stdin,stdout,expected_output,stderr,compile_output,status_id,status,time,memory,token,created_at,finished_at'
        },
        headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
    };

    async function fetchData() {
        try {
            const response = await axios.request(options)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    while (true) {

        const result = await fetchData()
        const isResultObtained = result.submissions.every((r) => r.status_id > 2)
        if (isResultObtained) {
            return result.submissions
        }
        await waiting(1000)
    }


};

module.exports = { getLanguageById, submitBatch, submitToken };