const mongoose = require('mongoose');

async function dbConnect() {
    if (!process.env.DB_CONNECT_STRING) {
        throw new Error("DB_CONNECT_STRING is not defined in .env file");
    }
    await mongoose.connect(process.env.DB_CONNECT_STRING);
    console.log("mongodb connected.")
}

module.exports = dbConnect;