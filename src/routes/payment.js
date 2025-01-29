const express = require("express")
const {verifyAuth} =require("../authClient")
const RazorpayInstance = require("../utils/Razorpay");
const Payment = require("../model/payment");
const mongoose = require("mongoose");
const User =require("../model/userSchema")
const{membershipAmount}=require("../utils/Constants")
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')


const paymentRoute= express.Router();

paymentRoute.post("/payment/createOrder", async (req, res) => {
    try {
        const token = req.cookies.token; 
        const membershipType = req.body.membershipType;
        console.log(membershipType);

        console.log(membershipAmount[membershipType]);
        
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        try {
            const authResponse = await verifyAuth(token);
            console.log("authresponse",authResponse);
            if (!authResponse.authenticated) {
                return res.status(401).json({ message: authResponse.message });
            }

            const userId = authResponse.userId;
            console.log("userid",userId);
            const  user = await User.findById(userId)
            console.log("user from payment",user);
            const order = await RazorpayInstance.orders.create({
                amount: membershipAmount[membershipType]*100,
                currency: "INR",
                receipt: "ROBIN",
                notes: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    membership: membershipType
                }
            });
            const payment = new Payment({
                userId: new mongoose.Types.ObjectId(userId), 
                orderId: order.id,
                status: order.status,
                amount: order.amount,
                currency: order.currency,
                notes: order.notes,
                receipt: "robin"
            });
            const saved_payments = await payment.save();
            res.status(200).json({
                ...saved_payments,
                key_id:process.env.RAZOR_PAY_KEY_ID
            })
        } catch (authError) {
            console.error('Auth service error:', authError);
            return res.status(500).json({ message: 'Authentication service error' });
        }
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});
paymentRoute.post("/payment_verify",async(req,res)=>{

try{
     const webhookSignature =req.headers[" X-Razorpay-Signature"]
     const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body),
     webhookSignature  , 
     process.env.RAZORPAY_WEBHOOK)
     if(!isWebhookValid){
        return res.status(400).json({msg: "Webhook signature is invalid "})
     }
     const paymentDetails = req.body.payload.payment.entity;
     const payment  = await Payment.findOne({orderId:paymentDetails.order_id})
     payment.status =paymentDetails.status
     await payment.save();
     const user = await User.findOne({_id:payment.userId})
     user.memberShipType = payment.notes.membership
     if(req.body.event == "payment.captured"){
       user.isPremium =true
     }
     if(req.body.event=="payment.failed"){
        user.isPremium =false
     }
     await user.save()
}catch(err){
    res.status(500).json({msg:err.message})
}


   
})





module.exports =paymentRoute