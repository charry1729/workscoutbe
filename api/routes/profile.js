const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');

//const Job = require('../models/jobs');
const Profile = require('../models/profile');
const User = require('../models/users');

const multer = require("multer");


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
        file.mimetype === "application/pdf"
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
router.post('/', uploads.single('resume'), (req, res, next) => {
    console.log("++++++++++");
    console.log("body : ", req.body);
    console.log("++++++++++");

    User.findById(req.body._id)
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'user not found'
                });
            }
            const profile = new Profile({
                _id: req.body._id,
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
                resume: req.file.path, //req.body.resume, //upload file 
                aboutMe: req.body.aboutMe,
                education: req.body.education,
                phoneNumber: req.body.phoneNumber,
                salary: req.body.salary,
                companyName: req.body.companyName



            });
            return profile.save();
        })
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Profile Stored",
                CreatedProfile: {
                    // ID: result._id,
                    // job: result.job,
                    // quantity: result.quantity,
                    _id: result._id,
                    // quantity: req.body.quantity,
                    // job: req.body.jobId
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


router.get('/', (req, res, next) => {
    Profile.find()
        //        .select('_id quantity job')
        .select('_id fullName email region professionalTitle category skills url experience resume aboutMe education phoneNumber salary companyName')
        .populate('profile', 'name _id')
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                count: result.length,
                Profiles: result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.get('/:_id', (req, res, next) => {
    Profile.findById(req.params._id)
        .populate('profile')
        .exec()
        .then(result => {
            res.status(200).json({
                result
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

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