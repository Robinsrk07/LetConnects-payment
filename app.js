const express = require("express");
const ConnectDb = require("./config/database");
const RazorpayInstance = require("./src/utils/Razorpay");
const Payment = require("./src/model/payment");
const { ObjectId } = require('mongoose').Types;
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { verifyAuth } = require('./src/authClient');  // Add this line
const paymentRouter =require("./src/routes/payment")

const app = express();
app.use(cookieParser());
app.use(express.json())


ConnectDb();
const port = 7000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


app.use("/",paymentRouter)
app.listen(7000, () => {
    console.log(`http://localhost:${port}`);
});