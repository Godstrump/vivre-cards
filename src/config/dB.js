const mongoose = require("mongoose");
const env = require("./config")

const connectDB = async (cb) => {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(env.mongodb_uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    cb()
};

module.exports = connectDB