const validator = require("validator");

const validate = (data) => {
    const mandatoryFields = ['firstName', 'email', 'password']; // Changed from 'name' to 'firstName'
    const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if (!isAllowed) {
        throw new Error("Missing required fields: firstName, email, and password.");
    }

    // Rest of the validator remains the same
    if (!validator.isEmail(data.email)) {
        throw new Error("Invalid email format.");
    }

    if (!validator.isStrongPassword(data.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new Error("Password is not strong enough. It requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.");
    }
};

module.exports = validate;















// const validator = require("validator");

// const validate = (data) => {
//     const mandatoryFields = ['name', 'email', 'password'];
//     const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

//     if (!isAllowed) {
//         throw new Error("Missing required fields: name, email, and password.");
//     }

//     if (!validator.isEmail(data.email)) {
//         throw new Error("Invalid email format.");
//     }

//     if (!validator.isStrongPassword(data.password, {
//         minLength: 8,
//         minLowercase: 1,
//         minUppercase: 1,
//         minNumbers: 1,
//         minSymbols: 1
//     })) {
//         throw new Error("Password is not strong enough. It requires min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.");
//     }
// };

// module.exports = validate;