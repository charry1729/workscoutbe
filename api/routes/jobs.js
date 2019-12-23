const express = require("express");
var cors = require('cors');
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const Job = require("../models/jobs");
const Profile = require("../models/profile")
const User = require("../models/users")
const JobApplication = require("../models/jobApplications")
router.all('*', cors());
const fs = require('fs')
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)


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
//const uploads = multer({dest : 'uploads/'})

router.get("/all",(req,res,next)=>{
    Job.find().populate('applicants').then((data)=>{
        console.log(data);
        res.status(200).json({
            jobs: data,
        })
    })
    // res.status(200).json({
    //     message:"done",
    // })
});

router.get("/", (req, res, next) => {
    Job.find()
        // .populate(applicants)
        .sort({
            createdAt: -1
        })

        // .select('jobId name title createdAt createdBy activeStatus primaryResponsibilities Requirements description location jobType url minimumrate maximumrate minimumsalary minimumsalary companyDetails companyName Website companyDescription')
        // .exec()
        .then(doc => {
            if (doc) {
                const result = {
                    count: doc.length,
                    jobs: doc.map(docs => {
                        return {
                            _id: docs._id,
                            name: docs.name,
                            title: docs.title,
                            createdAt: docs.createdAt,
                            createdBy: docs.createdBy,
                            activeStatus: docs.activeStatus,
                            primaryResponsibilities: docs.primaryResponsibilities,
                            requirements: docs.requirements,
                            description: docs.description,
                            location: docs.location,
                            jobType: docs.jobType,
                            url: docs.url,
                            minimumrate: docs.minimumrate,
                            maximumrate: docs.maximumrate,
                            minimumsalary: docs.minimumsalary,
                            maximumsalary: docs.maximumsalary,
                            companyDetails: docs.companyDetails,
                            companyName: docs.companyName,
                            Website: docs.Website,
                            companyDescription: docs.companyDescription,
                            request: {
                                type: "GET",
                                url: "http://"+SERVER_IP+"/job/" + docs._id
                            }
                        };
                    })
                };
                res.status(200).json(result);
            } else {
                res.status(404).json({
                    message: "No valid entry found for prodcutId"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/", checkAuth, (req, res, next) => {
    //router.post('/', checkAuth, uploads.single('productImage'), (req, res, next) => {
    // const product = {
    //     name : req.body.name,
    //     price : req.body.price
    // };
    // res.header("Access-Control-Allow-Origin", "*");
    console.log(req.body);

    console.log("----");

    const job = new Job({
        _id: new mongoose.Types.ObjectId(),
        // _id: new mongoose.Types.ObjectId(),
        //        jobId: docs._id,
        name: req.body.name,
        title: req.body.title,
        createdAt:new Date(),
        createdBy: req.body.createdBy,
        activeStatus: req.body.activeStatus,
        primaryResponsibilities: req.body.primaryResponsibilities,
        requirements: req.body.requirements,
        description: req.body.description,
        location: req.body.location,
        jobType: req.body.jobType,
        url: req.body.url,
        minimumrate: req.body.minimumrate,
        maximumrate: req.body.maximumrate,
        minimumsalary: req.body.minimumsalary,
        maximumsalary: req.body.maximumsalary,
        companyDetails: req.body.companyDetails,
        companyName: req.body.companyName,
        Website: req.body.Website,
        companyDescription: req.body.companyDescription,
        closeDate: req.body.closeDate,
        // createdBy: req.body.createdBy,
        // name: req.body.name,
        // price: req.body.price,
        // productImage: req.file.path
    });
    job.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Created Job",
                createdJob: {
                    _id: result._id,
                    // _id: new mongoose.Types.ObjectId(),
                    //        jobId: docs._id,
                    name: result.name,
                    title: result.title,
                    //        createdAt: req.body.createdAt,
                    createdAt: Date.now(),
                    createdBy: result.createdBy,
                    activeStatus: true, //result.activeStatus,
                    primaryResponsibilities: result.primaryResponsibilities,
                    requirements: result.requirements,
                    description: result.description,
                    location: result.location,
                    jobType: result.jobType,
                    url: result.url,
                    minimumrate: result.minimumrate,
                    maximumrate: result.maximumrate,
                    minimumsalary: result.minimumsalary,
                    maximumsalary: result.maximumsalary,
                    companyDetails: result.companyDetails,
                    companyName: result.companyName,
                    Website: result.Website,
                    companyDescription: result.companyDescription,
                    // name: result.name,
                    // price: result.price,
                    // ID: result._id,
                    request: {
                        type: "GET",
                        url: "http://"+SERVER_IP+"/job/" + result._id
                    }
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


router.post("/apply", uploads.single('resume'), checkAuth, (req, res, next) => {
    // console.log(req);
    // console.log(req.userData);
    // let user;
    // console.log(req.body);
    const file = req.file;

    if(! req.body.jobId){
        res.status(404).json({
            message:"JobId is not present",
        })
        return
    }
    // var jobFound ;
    const dat = req.body;
    if(! dat.applicantName && dat.applicantEmail){
        res.status(500).json({
            message:'Data is missing',
        })
        return;
    }

    var new_jobApplication ;

    Job.findById(req.body.jobId)
    .then(job=>{
        Profile.findById(req.body.applicantProfile)
        .then(profile=>{
            JobApplication.findOne({'applicantProfile':req.body.applicantProfile,'jobId':req.body.jobId})
            .then(found=>{
                console.log(found);
                if(found){
                    console.log(req.file.path);

                    unlinkAsync(req.file.path);
                    res.status(200).json({
                        message:"Already Applied",
                    })
                }else{
                    new_jobApplication = new JobApplication({
                                    _id: new mongoose.Types.ObjectId(),
                                    applicantName:req.body.applicantName,
                                    applicantEmail:req.body.applicantEmail,
                                    applicantMessage:req.body.applicantMessage,
                                    resume : file ? file.path : profile.resume,
                                    applicantProfile:profile,
                                    jobId:job,
                                });
                                new_jobApplication.save()
                                                    .then(jobapp=>{
                                                        console.log("JOb app is \n");
                                                        console.log(jobapp);
                                                        return Profile.findOneAndUpdate({
                                                            '_id':req.body.applicantProfile
                                                        },{
                                                            '$addToSet':{
                                                                jobsApplied: jobapp,
                                                            }
                                                        }).then((prof)=>{
                                                            console.log("Profile");
                                                            console.log(prof);
                                                            return Job.findOneAndUpdate(
                                                            {
                                                                '_id':req.body.jobId
                                                            },
                                                            {
                                                                '$addToSet':{
                                                                    applicants:jobapp,
                                                                }
                                                            }).then((jb)=>{
                                                                console.log(jb);
                                                            })
                                                        })
                                                    })
                                                    .then(()=>{
                                                        res.status(200).json({
                                                            message:"Job applied",
                                                        })
                                                    })
                                                    .catch(err=>{
                                                        res.status(500).json({
                                                            message:'Error while applying',
                                                            error : err,
                                                        })
                                                    })

                }
                
            }).catch(err=>{
                res.status(500).json({
                    message:"error occured",
                })
            })
        })
    })


    // Job.findById(req.body.jobId)
    // .then(()=>{

    //     User.findOne({
    //         email: req.userData.email,
    //     }).then(usr=>{
    //         // user = usr;
    //         // console.log("here");
    //         // console.log(usr);
    //         Profile.findOne({
    //             user_id : usr._id,
    //         }).then(profile=>{
    //             // console.log(profile);
    //             return Job.findOneAndUpdate(
    //                 {
    //                     '_id':req.body.jobId
    //                 },
    //                 {
    //                     '$addToSet':{
    //                         applicants:profile,
    //                     }
    //                 })
                
    //         }).then(()=>{
    //             return Job.findById(req.body.jobId)
    //                 .then(job=>{
    //                     return Profile.findOneAndUpdate(
    //                         {
    //                             user_id: usr._id,
    //                         },
    //                         {
    //                             '$addToSet':{
    //                                 jobsApplied:job,
    //                             }
    //                         }
    //                     )
    //                 })
    //                 .catch(err=>{
    //                     res.status(404).json({
    //                         message:"JobId Not found",
    //                     })
    //                     // return
    //                 })
    //         }).then(()=>{
    //             // console.log("Last always");
    //             res.status(200).json({
    //                 message:"Job applied successfully"
    //             })
    //         })
    //         .catch(err=>{
    //             res.status(404).json({
    //                 message : "Profile is not found"
    //             })
    //         })

            
    //     }).catch(err=>{
    //         res.status(500).json({
    //             message:"User not Found",
    //         })
    //     })

    // })
    // .catch(err=>{
    //     res.status(404).json({
    //         message:"Job Not found",
    //     })
    //     // return;
    // })
    

});


router.get("/:_id", async (req, res, next) => {

    Job.findById(req.params._id)
        // .populate("profile")
        // .exec()
        // .limit(5)
        // .sort({
        //     age: -1
        // });
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    job: doc,
                    request: {
                        type: "GET",
                        description: "Get All Jobs",
                        url: "http://"+SERVER_IP+"/job/" + doc._id
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for jobId"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    // const job2 = await Job.find({
    //     _id: req.body._id
    // })
    // console.log(job2);
    // res.json(job2);

    // Job.findById(req.params.jobId)
    //     //    .select('name title createdAt createdBy activeStatus primaryResponsibilities Requirements description location jobType url minimumrate maximumrate minimumsalary minimumsalary companyDetails companyName Website companyDescription')
    //     .exec().then(doc => {
    //         console.log(doc);
    //         if (doc) {
    //             res.status(200).json({
    //                 job: doc,
    //                 request: {
    //                     type: 'GET',
    //                     description: 'Get All Jobs',
    //                     url: 'http://"+SERVER_IP+"/job'
    //                 }
    //             });

    //         } else {
    //             res.status(404).json({
    //                 message: 'No valid entry found for jobId'
    //             });
    //         }
    //     }).catch(err => {
    //         console.log(err);
    //         res.status(500).json({
    //             error: err
    //         });
    //     });
});

router.get("/location/:location", async (req, res, next) => {
    //   const ID = req.params.jobId;
    //  console.log(ID);
    //   const job1 = await Job.findById(req.params.jobId)
    Job.find({
            location: req.params.location
        })
        .populate("profile")
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    job: doc
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for location"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get("/createdBy/:createdBy", async (req, res, next) => {
    //   const ID = req.params.jobId;
    //  console.log(ID);
    //   const job1 = await Job.findById(req.params.jobId)
    Job.find({
            createdBy: req.params.createdBy
        })
        .populate("profile")
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    job: doc,
                    request: {
                        type: "GET",
                        description: "Get All Jobs",
                        url: "http://"+SERVER_IP+"/job/" + req.params.createdBy
                    }
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for createdBy"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.patch("/:jobId", (req, res, next) => {
    const ID = req.params._id;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Job.update({
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
router.delete("/:_id", (req, res, next) => {
    const ID = req.params._id;
    Job.remove({
            _id: ID
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

router.post("/searchResult", async (req, res, next) => {
    console.log(req.body.title, req.body.location);

    Job.find({
            $or: [{
                    title: req.body.title
                    //   {
                    //     $regex: new RegExp("^" + title.toLowerCase(), "i")
                    //   }
                },
                {
                    location: req.body.location
                    //   {
                    //     $regex: new RegExp("^" + location.toLowerCase(), "i")
                    //   }
                }
            ]
        })
        .populate("job")
        .exec()
        .then(doc => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    job: doc
                });
            } else {
                res.status(404).json({
                    message: "No valid entry found for createdBy"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});



router.post("/applications", checkAuth,(req,res,next)=>{
    console.log("In applications");
    console.log(req.userData);
    User.findOne({
        email: req.userData.email,
    }).then(user=>{
        console.log(user);
        if(user.userType == 'applicant'){
            console.log("Not allowed to view")
        }else{
            return Job.findOne({
                _id : req.body.jobId,
            }).populate('applicants')
            .then(job=>{
                console.log("job is");
                console.log(job['createdBy']);
                console.log(user._id);
                console.log(typeof(job['createdBy']));
                console.log(typeof(user._id));

                if(String(job['createdBy']) == String(user._id)){
                    let data=[];
                    for(let i=0;i<job["applicants"].length;i++){
                        data[i] = {};
                        if(job['applicants'][i]['purchased']){
                            data[i]['resume'] = job['applicants'][i]['resume'];
                        }
                        data[i]['purchased'] = job['applicants'][i]['purchased'];
                        data[i]['applicationStatus'] = job['applicants'][i]['applicationStatus'];
                        data[i]['rating'] = job['applicants'][i]['rating'];
                        data[i]['note'] = job['applicants'][i]['note'];
                        data[i]['applicantName'] = job['applicants'][i]['applicantName'];
                        data[i]['applicantEmail'] = job['applicants'][i]['applicantEmail'];
                        data[i]['applicantMessage'] = job['applicants'][i]['applicantMessage'];
                    }
                    res.status(200).json({
                        applicants:data,
                    })
                }else{
                    res.status(401).json({
                        message:"Not allowed to view this job applicants",
                    })
                }
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error : "Error while fetching applications",
        })
    })
    
});


module.exports = router;