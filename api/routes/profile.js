const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

//const Job = require('../models/jobs');
const Profile = require('../models/profile');
const User = require('../models/users');


router.post('/', (req, res, next) => {
    Profile.find({user_id : req.body.userid})
        .then(profile => {
            if(profile) {
                return Profile.findOneAndUpdate(
                    {
                        user_id: req.body.userid
                    },
                    {
                        $set: {
                            // _id: new mongoose.Types.ObjectId(),
                            fullName: req.body.fullName,
                            email: req.body.email,
                            region: req.body.region,
                            professionalTitle: req.body.professionalTitle,
                            category: req.body.category,
                            skills: req.body.skills,
                            url: req.body.url,
                            experience: req.body.experience,
                            resume: req.body.resume, //upload file 
                            aboutMe: req.body.aboutMe,
                            education: req.body.education,
                            phoneNumber: req.body.phoneNumber,
                            salary: req.body.salary,
                            companyName: req.body.companyName,
                            }
                    },
                    function (err, doc) {
                        if (err) {
                            console.log("update document error");
                            return err;
                        } else {
                            console.log("update document success");
                            return doc;
                        }

                })
            }
            else{
                const new_profile = new Profile({
                    // _id: req.body._id,
                    _id: new mongoose.Types.ObjectId(),
                    user_id : req.body.userid,
                    //mongoose.Types.ObjectId(),
                    // quantity: req.body.quantity,
                    // job: req.body.jobId
                    fullName: req.body.fullName,
                    email: req.body.email,
                    region: req.body.region,
                    professionalTitle: req.body.professionalTitle,
                    category: req.body.category,
                    skills: req.body.skills,
                    url: req.body.url,
                    experience: req.body.experience,
                    resume: req.body.resume, //upload file 
                    aboutMe: req.body.aboutMe,
                    education: req.body.education,
                    phoneNumber: req.body.phoneNumber,
                    salary: req.body.salary,
                    companyName: req.body.companyName
                });
                return new_profile.save();
            }
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                // message: "Profile Stored",
                data: {
                    // ID: result._id,
                    // job: result.job,
                    // quantity: result.quantity,
                    // _id: result._id,
                    // quantity: req.body.quantity,
                    // job: req.body.jobId
                    userId: result.user_id,
                    fullName: result.fullName,
                    email: result.email,
                    region: result.region,
                    professionalTitle: result.professionalTitle,
                    category: result.category,
                    skills: result.skills,
                    url: result.url,
                    experience: result.experience,
                    resume: result.resume, //upload file 
                    aboutMe: result.aboutMe,
                    education: result.education,
                    phoneNumber: result.phoneNumber,
                    salary: result.salary,
                    companyName: result.companyName

                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/profile/' + result._id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });


});


router.get('/:userid', (req, res, next) => {
 Profile.findOne({user_id:req.params.userid})
        .then(result=>{
            res.status(201).json({
                data: {
                    _id: result._id,
                    userId: result.user_id,
                    fullName: result.fullName,
                    email: result.email,
                    region: result.region,
                    professionalTitle: result.professionalTitle,
                    category: result.category,
                    skills: result.skills,
                    url: result.url,
                    experience: result.experience,
                    resume: result.resume, //upload file 
                    aboutMe: result.aboutMe,
                    education: result.education,
                    phoneNumber: result.phoneNumber,
                    salary: result.salary,
                    companyName: result.companyName

                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/profile/' + result._id
                }
            });
        })
        .catch(err => {

            res.status(404).json({
                error: err
            });
        });

});

// router.get('/:_id', (req, res, next) => {
//     Profile.findById(req.params._id)
//         .populate('profile')
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 result
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });

// });

router.patch('/:_id', (req, res, next) => {
    res.status(200).json({
        message: 'Profile Updated'
    });
});


router.delete('/:_id', (req, res, next) => {
    Profile.remove({
            _id: req.params._id
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Profile has been deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });


});

module.exports = router;



// router.post('/', (req, res, next) => {
//     Profile.findById(req.body._id)
//         .then(job => {
//             if (!job) {
//                 return res.status(404).json({
//                     message: 'job not found'
//                 });
//             }
//             const order = new Order({
//                 _id: mongoose.Types.ObjectId(),
//                 quantity: req.body.quantity,
//                 job: req.body.jobId
//             });
//             return order.save();
//         })
//         .then(result => {
//             console.log(result);
//             res.status(201).json({
//                 message: "Order Stored",
//                 CreatedOrder: {
//                     ID: result._id,
//                     job: result.job,
//                     quantity: result.quantity
//                 },
//                 request: {
//                     type: 'GET',
//                     url: 'http://localhost:3000/orders/' + result._id
//                 }
//             });
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });


// });