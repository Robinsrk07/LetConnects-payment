const RazorpayInstance = require("../utils/Razorpay");
const Payment = require("../model/payment");
const mongoose = require("mongoose");
const User =require("../model/userSchema")
const{membershipAmount}=require("../utils/Constants")
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const {ValidationError,AuthenticationError,NotFoundError}= require("../utils/errors")


const  createOrder =async (req, res) => {
    try {
            const membershipType = req.body.membershipType;
            const {userId} = req
            const  user = await User.findById(userId)
            if(!user){
                 throw new NotFoundError("invalid User")
            }
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
        
    } catch (err) {
        next(err) 
       }
}

const paymentVerification =async(req,res,next)=>{
    try{
         const webhookSignature =req.get(" X-Razorpay-Signature")
         const isWebhookValid = validateWebhookSignature(JSON.stringify(req.body),
         webhookSignature  , 
         process.env.RAZORPAY_WEBHOOK)
         if(!isWebhookValid){
            throw new ValidationError("unValid web hook")
         }
         const paymentDetails = req.body.payload.payment.entity; 
         const payment  = await Payment.findOne({orderId:paymentDetails.order_id})
         if(!payment){
            throw new NotFoundError("payment not found")
         }
         payment.status =paymentDetails.status
         await payment.save();
         const user = await User.findOne({_id:payment.userId})
         if(!user){
            throw new NotFoundError("user not found")
         }
         user.memberShipType = payment.notes.membership
         if(req.body.event == "payment.captured"){
           user.isPremium =true
         }
         if(req.body.event=="payment.failed"){
            user.isPremium =false
         }
         await user.save()
    }catch(err){
    next(err)
    }
    }


    const premiumVerify = async(req,res)=>{
    
        try{
            const {userId} = req
            const  user = await User.findById(userId)
            if(!user){
               throw new NotFoundError("user not found")
            }
            if(user.isPremium){
                return res.json({isPremium:true})
            }
            if(!user.isPremium){
                return res.json({isPremium:false})
            }
            
        }catch(err){
         next(err)
        }
    
    }

    module.exports={createOrder,paymentVerification,premiumVerify}