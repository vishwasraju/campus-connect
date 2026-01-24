const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            ssl: true,
            tlsAllowInvalidCertificates: false,
            serverSelectionTimeoutMS: 10000,
        });
    }
    catch(e){
        console.log(e)
    }
}

module.exports = connectDB;