require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/quizapp",
  jwtSecret: process.env.JWT_SECRET || "default_secret_key",
};
