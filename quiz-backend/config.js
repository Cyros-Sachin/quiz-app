require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGO_URI || "mongodb://192.168.56.1:27017/quizapp",
  jwtSecret: process.env.JWT_SECRET || "ewadfgeghyjzse4tgnhtjsw",
};
