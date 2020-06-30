const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const isApplicant = require("../middleware/isapplicant");
const isRecruiter  = require("../middleware/isrecruiter")
const Job = require("../models/jobs");
const Profile = require("../models/profile")
const User = require("../models/users")
const JobApplication = require("../models/jobApplications")
const fs = require('fs')
const { promisify } = require('util')

const unlinkAsync = promisify(fs.unlink)


const SERVER_IP = "34.224.1.240:3001";
// const SERVER_IP = "3.229.152.95:3001";
// const SERVER_IP = "localhost:3001";

const APPLICANT_LIMIT = 10;
const JOB_LIMIT = 25;

const randomName = function(length){
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + randomName(5));
    }
});

const fileFilter = (req, file, cb) => {
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

router.get("/all",(req,res,next)=>{
    Job.find().populate('applicants').then((data)=>{
        console.log(data);
        res.status(200).json({
            jobs: data,
        })
    })
});

router.get("/testget", (req, res, next) => {
    Job.find({
        filled: false,
    })
        .sort({
            createdAt: -1
        })

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
                            salaryType: docs.salaryType,
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

router.get("/",(req,res,next)=>{

    let jb = ['freelance','part time','full time','internship','contract'];
    let skipNum  = 0;
    let sortQuery = {'createdAt':-1} 
    if(req.body.sort){
        if(req.body.sort=="createdAt" || req.body.sort=="maximumsalary"){
            sortQuery = {},
            sortQuery[req.body.sort] = req.body.sortDir || -1;
        }
    }

    Job.find({
        filled:false,
        jobType:{
            $in: jb,
        },
    })
    .select({
        applicants:0,
        views:0
    })
    .sort(sortQuery)
    .skip( skipNum  )
    .limit(25)
    .then(jobs=>{

        Job.aggregate([
            {
                $match: {
                    filled:false,
                    jobType:{
                        $in: jb,
                    },
                }
            },
            {
                $group: {
                    _id:"$jobType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                  _id: 0,
                  jobType: "$_id",
                  count: 1,
                }
            }
        ])
        // Job.distin
        .then(result=>{
            res.status(200).json({
                counts:result,
                jobs
            })
        })
        

    })
});

router.post("/search/",isApplicant,(req,res,next)=>{
    let jb = ['freelance','part time','full time','internship','contract'];
    let skipNum  = 0;
    try{
        if(isNaN(Number(req.body.page))){
            throw "Not a numnber"
        }
        skipNum = (Number(req.body.page)-1)*25 > 0 ? (Number(req.body.page)-1)*25 : 0 ;
    }
    catch(err){
    }
    if((req.body.jobType || []).length){
        jb = req.body.jobType.split(",");
    }
    let sortQuery = {'createdAt':-1} 
    if(req.body.sort){
        if(req.body.sort=="createdAt" || req.body.sort=="maximumsalary"){
            sortQuery = {},
            sortQuery[req.body.sort] = req.body.sortDir || -1;
        }
    }
    let keyword= req.body.keyword || "";
    let location= req.body.location || "";

    Job.find({
        $or:[
            {
                primaryResponsibilities:{
                    $regex: new RegExp(keyword, "i")
                }
            },
            {
                companyName:{
                    $regex: new RegExp(keyword, "i")
                }
            },
            {
                title:{
                    $regex: new RegExp(keyword, "i")
                }
            }
        ],
        filled:false,
        jobType:{
            $in: jb,
        },
        location:{
            $regex: new RegExp(location, "i")
        }
    })
    .select({
        applicants:0,
        views:0,
    })
    .sort(sortQuery)
    .skip( skipNum  )
    .limit(JOB_LIMIT)
    .then(jobs=>{

        Job.aggregate([
            {
                $match: {
                    $or:[
                        {
                            primaryResponsibilities:{
                                $regex: new RegExp(keyword, "i")
                            }
                        },
                        {
                            companyName:{
                                $regex: new RegExp(keyword, "i")
                            }
                        },
                        {
                            title:{
                                $regex: new RegExp(keyword, "i")
                            }
                        }
                    ],
                    filled:false,
                    jobType:{
                        $in: jb,
                    },
                    location:{
                        $regex: new RegExp(location, "i")
                    }
                }
            },
            {
                $group: {
                    _id:"$jobType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                  _id: 0,
                  jobType: "$_id",
                  count: 1,
                }
            }
        ])
        .then(result=>{
            res.status(200).json({
                counts:result,
                jobs
            })
        })
        

    })
})


router.post("/", isRecruiter, (req, res, next) => {

    const job = new Job({
        _id: new mongoose.Types.ObjectId(),
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
        email:req.body.email,
        experience: req.body.experience,
        minimumrate: req.body.minimumrate,
        maximumrate: req.body.maximumrate,
        minimumsalary: req.body.minimumsalary,
        maximumsalary: req.body.maximumsalary,
        companyDetails: req.body.companyDetails,
        currencysymbol: req.body.currencysymbol,
        companyName: req.body.companyName,
        Website: req.body.Website,
        companyDescription: req.body.companyDescription,
        closeDate: req.body.closeDate,
        salaryType: req.body.salaryType || 'YEARLY',

    });
    job.save()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Created Job",
                createdJob: {
                    _id: result._id,

                    name: result.name,
                    title: result.title,
                    createdAt: Date.now(),
                    createdBy: result.createdBy,
                    activeStatus: true, //result.activeStatus,
                    primaryResponsibilities: result.primaryResponsibilities,
                    requirements: result.requirements,
                    description: result.description,
                    email:req.body.email,
                    location: result.location,
                    jobType: result.jobType,
                    url: result.url,
                    minimumrate: result.minimumrate,
                    maximumrate: result.maximumrate,
                    minimumsalary: result.minimumsalary,
                    maximumsalary: result.maximumsalary,
                    salaryType: result.salaryType,
                    companyDetails: result.companyDetails,
                    companyName: result.companyName,
                    Website: result.Website,
                    companyDescription: result.companyDescription,
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


router.post("/update",isRecruiter,(req,res,next)=>{

    Job.findOneAndUpdate({'_id':req.body.jobID,createdBy:req.userData.userId},
        {
            $set:{
                name: req.body.name,
                email: req.body.email,
                title: req.body.title,
                primaryResponsibilities: req.body.primaryResponsibilities,
                requirements: req.body.requirements,
                description:req.body.description,
                location: req.body.location,
                jobType: req.body.jobType,
                url: req.body.url,
                minimumsalary: req.body.minimumsalary,
                maximumsalary: req.body.maximumsalary,
                experience: req.body.experience,
                closeDate: req.body.closeDate,
                salaryType: req.body.salaryType,
                companyName: req.body.companyName,
                Website: req.body.Website,
                companyDescription: req.body.companyDescription,
            }
        },
        function(err,doc){
            if(err){
                res.status(404).json({
                    message:"error updating the job"
                })
            }else{

                console.log(doc);
                res.status(200).json({
                    message:"Update complete"
                });
            }
        }
        )
    
});


router.post("/apply", uploads.single('resume'), checkAuth, (req, res, next) => {

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
                                    appliedOn: new Date(),
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

    

});


router.get("/:_id", async (req, res, next) => {

    Job.findById(req.params._id)

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
});

router.get("/location/:location", async (req, res, next) => {

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

    Job.find({
            createdBy: req.params.createdBy
        })
        // .populate("profile")
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
router.delete("/:_id", checkAuth,(req, res, next) => {
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

router.post("/markFilled",isRecruiter,(req,res,next)=>{
    console.log({createdBy:req.userData.userId,_id:req.body.jobID});
    Job.findOneAndUpdate({createdBy:req.userData.userId,_id:req.body.jobID},
    {
        $set:{
            filled: true,
        }
    },
    function(err,doc){
        if(err){
            res.status(403).json({
                message:"Permission denied",
            })
            return
        }
        console.log(doc);
        if(!doc){
            res.status(404).json({
                message:"Job not found",
            })
        }
        else{
            res.status(200).json({
                message:"Marked as Filled",
            })
        }
    }
    )
})

router.post("/searchResult", async (req, res, next) => {
    console.log(req.body.title, req.body.location);

    Job.find({
            $or: [{
                    title: req.body.title
                },
                {
                    location: req.body.location
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

router.get("/allapps",(res,req,next)=>{
    console.log(JobApplication)
    JobApplication.find().then(doc=>{
        res.status(200).json({
            data: doc,
        })
    })
});

router.post("/application/purchase",isRecruiter,(req,res,next)=>{
    console.log("In purchase");
    console.log(req.body);
    if(!req.body.applicationId){
        res.status(404).json({
            message:"No applicationId found"
        })
        return;
    }

    JobApplication.findById(req.body.applicationId,function(err,doc){if(err){
        return err;
    }
    console.log(doc);
    return doc;
    }).then(application=>{
        console.log(application)
        if(! application){
            res.status(404).json({
                message:"Not found",
            })
            return
        }
        User.findOne({
            email:req.userData.email,
        }).then(usr=>{
            if(application.purchased){
                res.status(200).json({
                    message:"Already Purchased",
                    resume:application.resume,
                })
                return
            }

            if(usr.resumedownloadlimit<1){
                res.status(403).json({
                    message:"No resumes left download package to get more resumes",
                })
            }else{
                return User.update({
                    email: req.userData.email,
                }, {
                    $set: {resumedownloadlimit: usr.resumedownloadlimit - 1}
                }).then(data=>{
                    return JobApplication.findOneAndUpdate({
                        _id:req.body.applicationId,
                    },
                    {
                        $set:{
                            purchased:true,
                        }
                    },
                    function(err,doc){
                        if(err){

                        }
                        console.log(doc)
                        // console.log(application);
                        res.status(200).json({
                            message:'purchased',
                            resume: application.resume,
                        })

                    })
                })

            }
        })


    }).catch(err=>{
        res.status(404).json({
            message:"No application found"
        })
    })


});

router.get("/viewed/:id",(req,res,next)=>{
    console.log(req.params);
    let jobID = req.params.id;
    if(!jobID){
        return res.status(500).send();
    }
    Job.findOneAndUpdate(
        {
            _id:jobID,
        },
        {
            $inc:{
                views:1,
            }
        },function(err,doc){
            console.log("Done",err,doc);
            if(err){
                return res.status(500).json({});
            }
            if(doc){
                return res.status(200).json({});
            }else{
                res.status(404).send()
            }
        }
    )
});



router.post("/posted", isRecruiter,(req,res,next)=>{
    User.findOne({
        email: req.userData.email,
    }).then(user=>{
        if(user.userType == 'applicant'){
            console.log("Not allowed to view")
            res.status(403).json({
                message:"Not allowed to view resumes",
            })
        }else{
            return Job.find({
                createdBy: req.userData.userId,
            })
            .populate({
                path:'applicants',
                select:'applicantName',
            })

            .then(jobs=>{

                let dataTosend = JSON.parse(JSON.stringify(jobs));
                let i=0;
                jobs.forEach(job=>{
                    dataTosend[i]['applicants'] = job['applicants'].length;
                    i+=1;
                })
                res.status(200).json({
                    message:"Job and Applicant",
                    job: dataTosend,
                })
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error : "Error while fetching applications",
        })
    })
    
});

router.post("/applicants", isRecruiter ,(req,res,next)=>{
    let findFilter = { createdBy: req.userData.userId };
    if(req.body.jobId){
        findFilter['_id'] = req.body.jobId;
    }
    console.log(findFilter);
    User.findById(req.userData.userId)
    .then(user=>{
        Job.find(findFilter)
        .select({_id:1,applicants:1})
        .populate("applicants")
        .then(jobs=>{
            let jobIds = [];
            jobs.forEach(job=>{
                jobIds.push(job['_id']);
            })
            let page= isNaN(Number(req.body.page)) ? 0 : Number(req.body.page);
            let skipE = (page-1)*APPLICANT_LIMIT;
            

            let appStatus = ['NEW','INTERVIEWED','OFFER EXTENDED','HIRED','ARCHIVED'];
            if(req.body.appStatus && req.body.appStatus != "none"){
                appStatus = [req.body.appStatus]
            }
            let sortF = {'appliedOn':-1};
            if(req.body.sortBy){
                if(req.body.sortBy == "appliedOn"){
                    sortF = {'appliedOn':-1};
                }
                if(req.body.sortBy == "name"){
                    sortF = {'applicantName':1};
                }
                if(req.body.sortBy == 'rating'){
                    sortF = {'rating':-1};
                }
            }
            let selectFilter = {'applicantProfile':0};
            if(user.resumedownloadlimit<1){
                selectFilter = {'applicantProfile':0 , 'applicantEmail':0, 'applicantMessage':0 };
            }
            JobApplication.find({
                jobId:{
                    $in:jobIds,
                },
                applicationStatus:{
                    $in:appStatus,
                }
            })
            .select(selectFilter)
            .sort(sortF)
            .limit(APPLICANT_LIMIT)
            .skip(skipE)
            .then(applicants=>{

                res.json({
                    resumeLimit:user.resumedownloadlimit,
                    applications:applicants
                })
            })
        })

    })

    

});

router.post("/application/delete",isRecruiter,(req,res,next)=>{
    const appId = req.body.applicationId;
    // JobApplication.findById({ // TODO remove from job too
        
    // })
    JobApplication.remove({
        _id: appId,
    }).then(re=>{
        res.status(200).json({
            message:"Deleted successfully"
        })
    }).catch(err=>{
        res.status(500).json({
            message:"An error occured",
            error: err,
        })
    })
});


router.post("/application/addNote",isRecruiter,(req,res,next)=>{
    const appId = req.body.applicationId;
    JobApplication.findOneAndUpdate(
        {
            _id:appId
        },
        {
            $set:{
                note : req.body.note,
            }
        }).then(doc=>{
            res.status(200).json({
                message:"Note added",
            })
        })
        .catch(err=>{
            res.status(500).json({
                message:"Error while adding note",
            })
        })

});


router.post("/application/edit",isRecruiter,(req,res,next)=>{
    console.log('In edit');
    const appId = req.body.applicationId;
    JobApplication.findOneAndUpdate(
        {
            _id:appId
        },
        {
            $set:{
                applicationStatus : req.body.applicationStatus.toUpperCase(),
                rating: req.body.rating,
            }
        }).then(doc=>{
            res.status(200).json({
                message:"Succesfully added",
            })
        })
        .catch(err=>{
            res.status(500).json({
                message:"Error while making changes",
            })
        })

});


router.post('/appl',(req,res,next)=>{
    JobApplication.find().then(appls=>{
        res.status(200).json({
            data:appls,
        })
    })
});

router.post("/testing",isRecruiter,(req,res,next)=>{
    console.log(req.userData);
    res.status(200).json({
        message:"check",
    });
});

module.exports.routes = router;