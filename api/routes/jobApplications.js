
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const Job = require("../models/jobs");
const Profile = require("../models/profile")
const User = require("../models/users")
const JobApplication = require("../models/jobApplications")
const fs = require('fs')
const { promisify } = require('util')


// router.post("/purchase",checkAuth,(req,res,next)=>{

// 	console.log("In purchase");
//     console.log(req.body);
//     if(!req.body.applicationId){
//         res.status(404).json({
//             message:"No applicationId found"
//         })
//         return;
//     }
//     JobApplication.findById(req.body.applicationId).then(applicant=>{
//         console.log(applicant);
//         res.status(200).json({
//             message:'nonsense',
//         });
//     })

//     JobApplication.find({"_id":req.body.applicationId}).then(doc=>{
//         console.log(doc);
//     })

// });

// router.get("/alljob",(req,res,next)=>{
// 	Job.find().then(job=>{
// 		res.status(200).json({
// 			data:job,
// 		})
// 	})
// })




// router.get("/allapps",(req,res,next)=>{
//     console.log("\ncoming here\n");
//     JobApplication.find().then(doc=>{
//     	console.log(doc)
//         res.status(200).json({
//             data: doc,
//         })
//     })
// });




module.exports = router;