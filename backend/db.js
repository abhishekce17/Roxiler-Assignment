require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

const connectToMongo = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("MongoDB connected");
    } catch (error) {
        console.error(error);
    }
}
mongoose.set('strictQuery', true);
module.exports = connectToMongo;