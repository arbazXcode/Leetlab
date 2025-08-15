const mongoose = require('mongoose');

async function main() {
    if (!process.env.DB_CONNECT_STRING) {
        throw new Error("DB_CONNECT_STRING is not defined in .env file");
    }
    await mongoose.connect(process.env.DB_CONNECT_STRING);
}

module.exports = main;