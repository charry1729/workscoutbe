const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

//const Job = require('../models/jobs');
const Profile = require('../models/profile');
const User = require('../models/users');

const multer = require("multer");

// const SERVER_IP = "3.229.152.95:3001";
const SERVER_IP = "localhost:3001";



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    //    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    if (
        file.mimetype === "application/doc" ||
        file.mimetype === "application/docx" ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimetype === "application/msword"
    ) {
        cb(null, true); //accept a file
    } else {
        cb(
            new Error({
                message: "File Type is not accepted"
            }),
            false
        ); //reject a file
    }
};

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});
// const uploads = multer({
//     dest: 'uploads/'
// })
//checkAuth
// router.post('/', uploads.single('resume'), (req, res, next) => {
//     console.log("++++++++++");
//     console.log("body : ", req.body);
//     console.log("++++++++++");

router.post('/',uploads.single('resume'), (req, res, next) => {
    const file = req.file
    console.log(req.body);
    Profile.find({user_id : req.body.userid})
        .then(profile => {
            if(profile.length!=0) {
                // console.log(profile);
                // console.log((req.body.fullName || profile.fullName))
                // return;
                return Profile.findOneAndUpdate(
                    {
                        user_id: req.body.userid
                    },
                    {
                        $set: {
                            // _id: new mongoose.Types.ObjectId(),
                            fullName: req.body.fullName ? req.body.fullName : profile[0].fullName,
                            email: req.body.email ? req.body.email : profile[0].email,
                            region: req.body.region ? req.body.region : profile[0].region,
                            professionalTitle: req.body.professionalTitle ? req.body.professionalTitle : profile[0].professionalTitle,
                            category: req.body.category ? req.body.category : profile[0].category,
                            skills: req.body.skills ? req.body.skills : profile[0].skills,
                            url:  req.body.url ? req.body.url : profile[0].url,
                            experience: req.body.experience ? req.body.experience : profile[0].experience,
                            resume: file ? file.path : profile[0].resume, //upload file 
                            aboutMe: req.body.aboutMe ? req.body.aboutMe : profile[0].aboutMe,
                            education: req.body.education ? req.body.education : profile[0].education,
                            phoneNumber:  req.body.phoneNumber ? req.body.phoneNumber : profile[0].phoneNumber,
                            salary: req.body.salary ? req.body.salary : profile.salary,
                            companyName: req.body.companyName ? req.body.companyName : profile[0].companyName,
                            }
                    },
                    function (err, doc) {
                        if (err) {
                            console.log("update document error");
                            return err;
                        } else {
                            console.log("update document success");
                            console.log(doc);
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
                    resume: file ? file.path : null, //upload file 
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
                    url: 'http://'+SERVER_IP+'/profile/' + result._id
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
router.get("/:userid/all",(req,res,next)=>{
    Profile.findOne({user_id:req.params.userid})
    // .populate('jobsApplied')
        // .populate('jobsApplied','jobId')

    .then((data)=>{
        console.log(data);
        res.status(200).json({
            profile: data,
        })
    })
    // res.status(200).json({
    //     message:"done",
    // })
});

router.get('/:userid', (req, res, next) => {
 Profile.findOne({user_id:req.params.userid})
        .populate('jobsApplied','jobId')
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
                    companyName: result.companyName,
                    jobsApplied: result.jobsApplied,
                },
                request: {
                    type: 'GET',
                    url: 'http://'+SERVER_IP+'/profile/' + result._id
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
    console.log(req.body);

    const ID = req.params._id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Profile.update({
            _id: ID
        }, {
            $set: updateOps
        })
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
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
//                     url: 'http://'+SERVER_IP+'/orders/' + result._id
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