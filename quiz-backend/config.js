require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGO_URI || "mongodb+srv://Admin:sachin123@codeclash.upviqrp.mongodb.net/?retryWrites=true&w=majority&appName=CodeClash",
  jwtSecret: process.env.JWT_SECRET || "ewadfgeghyjzse4tgnhtjsw",
};
