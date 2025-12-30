const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Problem title is required."],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: [true, "Problem description is required."],
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: [true, "Difficulty level is required."]
    },
    tags: {
        type: [String],
        enum: [
            // Data Structures
            "array",
            "string",
            "linked list",
            "stack",
            "queue",
            "heap",
            "tree",
            "graph",
            "matrix",

            // Techniques
            "two pointers",
            "sliding window",
            "bit manipulation",
            "hashing",
            "prefix sum",
            "greedy",
            "binary search",
            "backtracking",
            "recursion",
            "divide and conquer",

            // Advanced
            "dp",
            "trie",
            "union find",
            "topological sort"
        ],
        default: [],
        required: true
    },
    visibleTestCases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            required: true
        }
    }],
    hiddenTestCases: [{
        input: {
            type: String,
            required: true
        },
        output: {
            type: String,
            required: true
        }
    }],
    startCode: [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true
            }
        }
    ],
    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inputFormat: {
        type: String,
        enum: [
            "array",
            "array+int",
            "array+array",
            "string",
            "string+string",
            "matrix",
            "linkedlist",
            "tree",
            "graph",
            "custom"
        ],
        required: true
    },
    referenceSolution: [
        {
            language: {
                type: String,
                required: true,
            },
            completeCode: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
