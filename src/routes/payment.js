const express = require("express")
const {verifyAuthentication} =require("../middlewares/authMiddleWare")
const paymentRoute= express.Router();

const{createOrder,paymentVerification,premiumVerify} = require("../controllers/paymentController")

paymentRoute.post("/payment/createOrder",verifyAuthentication, createOrder);
paymentRoute.post("/payment/payment_verify",paymentVerification)
paymentRoute.get("/payment/premium/verify",verifyAuthentication,premiumVerify)




module.exports =paymentRoute