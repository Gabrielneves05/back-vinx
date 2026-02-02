const mongoose = require("mongoose");

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const conn = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster-vinx.cpyaaok.mongodb.net/vinx?retryWrites=true&w=majority&appName=cluster-vinx`
    );

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

conn();

module.exports = conn;
