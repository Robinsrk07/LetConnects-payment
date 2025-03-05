require('dotenv').config();
const mongoose = require('mongoose');

const ConnectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Server connected");
  } catch (err) {
    console.log("Error occurred:", err);
  }
};

ConnectDb();

module.exports = ConnectDb;
