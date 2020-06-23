const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/check-auth");
const isApplicant = require("../middleware/isapplicant");
const isRecruiter  = require("../middleware/isrecruiter")
const schedule = require("node-schedule");
const Payment = require('../models/payment');

const User = require('../models/users');
const Profile = require("../models/profile")
const PAY_SECRET = process.env.PAY_SECRET;
const PAY_PUB_KEY = process.env.PAY_PUB_KEY;
console.log(PAY_SECRET);
const stripe = require('stripe')(PAY_SECRET);

const currency = 'usd'; 

const plans = {
    'startup':{
        amount:100 * 100,
        currency:currency,
        addLimit: 30
    },
    'company':{
        amount:300 * 100,
        currency:currency,
        addLimit : 120,
    },
    'enterprise':{
        amount:500 * 100,
        currency:currency,
        addLimit:200
    }
}

async function createPaymentIntent(amount,userName){
    return await stripe.paymentIntents.create({
        description: 'Software development services',
        payment_method_types:['card'],
        shipping: {
            name: userName,
            address: {
              line1: '510 Townsend St',
              postal_code: '98140',
              city: 'San Francisco',
              state: 'CA',
              country: 'US',
            },
        },
        amount: amount,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
      }); 
}


router.post('/create-payment-intent',isRecruiter ,async (req,res)=>{
    if(!req.body.plan){
        return res.status(401).json({
            message:"Plan not specified"
        })
    }
    if(!plans[req.body.plan]){
        return res.status(403).json({
            message:"Invalid Plan Provided",
        })
    }
    let plan = plans[req.body.plan]
    const intent = await createPaymentIntent(plan.amount,req.userData.name || 'AnonymousUser');
    console.log("intent",intent)
    res.json({
        publishableKey: PAY_PUB_KEY,
        clientSecret:intent.client_secret,
        plan:plans[req.body.plan],
    })
})

router.get('/planInfo/:plan',isRecruiter,(req,res)=>{
    if(!(req.params.plan || plans[req.params.plan]) ){
        res.status(400).send({
            message:"Invalid plan data"
        })
    }
    let plan = plans[req.params.plan];
    res.send({plan:plan});
})

router.post('/payment/status/:intentId',isRecruiter,async (req,res)=>{
    if(!req.params.intentId){
        return res.status(400).status({
            message:"Invalid request"
        })
    }
    const payment_intent = req.params.intentId;
    // const data = await stripe.paymentIntents.retrieve(intent);
    stripe.paymentIntents.retrieve(
        payment_intent,function(err,paymentdata){
            if(err){
                res.status(400).send({
                    message:"Invalid payment-intent",
                })
            }else{
                if(paymentdata.status!='succeeded'){
                    res.status(400).status({
                        message:"invalid request"
                    })
                    return;
                }
                Payment.findOne({
                    payment_intent_id:payment_intent
                }).then(payment=>{
                    if(payment){
                        res.send({
                            message:"Payment already processed",
                        })
                    }else{
                        let addResumesLimit = 0;
                        for(plan in plans){
                            if(plans[plan].amount==paymentdata.amount){
                                addResumesLimit = plans[plan]['addLimit'];
                                break;
                            }
                        }
                        User.findOneAndUpdate({
                            _id: req.userData.userId,
                        },{
                            $inc:{
                                resumedownloadlimit: addResumesLimit
                            }
                        },function(err,user){
                            if(err){
                                res.status(500).send({
                                    message:'Somethin went wrong',
                                })
                            }else{
                                var paymentObj = new Payment({
                                    payment_intent_id: payment_intent,
                                    user:user
                                })
                                paymentObj.save()
                                .then(result=>{
                                    console.log("Created Payment",result);
                                    res.status(200).send({
                                        message:'Successfully added'
                                    })
                                })
                                .catch(err=>{
                                    res.status(500).send({
                                        message:"Failed to add payment",
                                        error:err
                                    })
                                })
                            }
                        })
                        
                    }
                })
            }
        }
    )
})
module.exports = router;
