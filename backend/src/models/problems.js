const mongoose = require('mongoose');
const {Schema} = mongoose;

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
        enum: ['array','linked list', 'dp', 'graph'],
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
            required:true
        },
        explanation : {
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
            required:true
        }
    }],
    startCode : [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode : {
                type: String,
                required : true
            }
        }
    ],
    problemCreator : {
        type: Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    referenceSolution : [
        {
            language: {
                type: String,
                required: true,
            },
            completeCode : {
                type: String,
                required : true
            }
        }
    ]
}, { timestamps: true });

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;
