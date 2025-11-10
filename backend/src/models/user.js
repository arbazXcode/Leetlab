const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    // Keep emailId for backward compatibility but don't use it
    emailId: {
        type: String,
        sparse: true // This allows multiple null values
    },
    age: {
        type: Number,
        min: 6,
        max: 80
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    problemSolved: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Problem"
            }
        ],
        default: []
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

userSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await mongoose.model("Submission").deleteMany({ userId: doc._id })
    }
})

const User = mongoose.model("User", userSchema);
module.exports = User;