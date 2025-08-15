const validator = require("validator");

const validate = (data) => {
    const mandatoryFields = ['firstName', 'emailId', 'password'];
    const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if (!isAllowed) {
        throw new Error("Missing required fields: firstName, emailId, and password.");
    }

    if (!validator.isEmail(data.emailId)) {
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