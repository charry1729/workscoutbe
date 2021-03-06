const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth');
const isRecruiter  = require("../middleware/isrecruiter")
const process = require('process');
const Profile = require('../models/profile');
const User = require('../models/users');
const ResumePurchase = require('../models/resumePurchase')
const organisationController = require('./organisation');
const multer = require("multer");
const util = require('../../util');

const SERVER_IP = process.env.SERVER_IP;

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
        let type = file.originalname.split('.');
        type ='.'+type[type.length-1];
        cb(null, new Date().toISOString() + randomName(15)+type);
    }
});

const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        let type = file.originalname.split('.');
        type ='.'+type[type.length-1];
        cb(null, new Date().toISOString() + randomName(15)+type);
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

const fileFilter2 = (req, file, cb) => {
    if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png"
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

const uploads2 = multer({
    storage: storage2,
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter: fileFilter2
});

router.post("/myprofile",uploads2.single('image'),(req,res,next)=>{
    const file = req.file
    Profile.find({user_id:req.body.userid})
        .then(profile=>{
            return Profile.findOneAndUpdate(
                {
                    user_id:req.body.userid
                },
                {
                    $set:{
                        fullName: req.body.fullName || profile[0].fullName,
                        email:req.body.email || profile[0].email,
                        aboutMe:req.body.aboutMe || profile[0].aboutMe,
                        image: file? file.path : profile[0].image,
                        phoneNumber:req.body.phoneNumber || profile[0].phoneNumber,
                        videoUrl: req.body.videoUrl || profile[0].videoUrl,
                        updated: new Date(),
                    }
                },
                function(err,doc){
                    if(err){
                        res.status(500).json({
                            message:"Error while updating profile",
                        })
                    }else{
                        let img = file? file.path : profile[0].image;
                        res.status(200).json({
                            message: "Profile Updated Successfully",
                            image: img,
                        })
                    }
                }
                )


        })
        .catch(err=>{
            res.status(404).json({
                message:"No profile found",
            })
        })
});

router.post('/',checkAuth,uploads.single('resume'),(req, res, next) => {
    //Validations 
    let data = req.body;
    if(!( data.email && data.fullName && data.region && data.skills && data.phoneNumber && data.aboutMe && data.category ) || !util.validateEmail(data.email)){
        return res.status(403).send({
            message:'Data sent is invalid',
        })
    }
    const file = req.file;
    Profile.find({user_id : req.body.userid})
        .then(profile => {
            if(profile.length!=0) {
                return Profile.findOneAndUpdate(
                    {
                        user_id: req.body.userid
                    },
                    {
                        $set: {
                            fullName: req.body.fullName ? req.body.fullName : profile[0].fullName,
                            email: req.body.email ? req.body.email : profile[0].email,
                            region: req.body.region ? req.body.region : profile[0].region,
                            professionalTitle: req.body.professionalTitle || '',
                            category: req.body.category ? req.body.category : profile[0].category,
                            skills: req.body.skills ? req.body.skills : profile[0].skills,
                            url:  req.body.url || '',
                            experience: req.body.experience ? req.body.experience : profile[0].experience,
                            resume: file ? file.path : profile[0].resume, //upload file 
                            aboutMe: req.body.aboutMe ? req.body.aboutMe : profile[0].aboutMe,
                            education: req.body.education || '',
                            phoneNumber:  req.body.phoneNumber ? req.body.phoneNumber : profile[0].phoneNumber,
                            salaryperyear: req.body.salaryperyear ? req.body.salaryperyear : profile.salaryperyear,
                            salaryperhour: req.body.salaryperhour ? req.body.salaryperhour : profile.salaryperhour,
                            videoUrl: req.body.videoUrl || '',
                            companyName: req.body.companyName || '',
                            updated: new Date(),
                            }
                    },
                    function (err, doc) {
                        if (err) {
                            // console.log("update document error");
                            return err;
                        } else {
                            // console.log("update document success");
                            return doc;
                        }

                })
            }
            else{
                const new_profile = new Profile({
                    _id: new mongoose.Types.ObjectId(),
                    user_id : req.body.userid,

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
                    salaryperhour: req.body.salaryperhour,
                    salaryperyear: req.body.salaryperyear,
                    companyName: req.body.companyName,
                    updated: new Date(),
                });
                return new_profile.save();
            }
        })
        .then(result => {
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
                    salaryperyear: result.salaryperyear,
                    salaryperhour: result.salaryperhour,
                    companyName: result.companyName,
                    jobsApplied: result.jobsApplied,
                    updated: new Date(),
                },
                request: {
                    type: 'GET',
                    url: 'http://'+SERVER_IP+'/profile/' + result._id
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.get("/:userid/profile",(req,res,next)=>{
    Profile.findOne({user_id:req.params.userid})
    .populate('jobsApplied')

    .then((data)=>{
        // console.log(data);
        res.status(200).json({
            profile: data,
        })
    })

});


router.get('/:userid', checkAuth,(req, res, next) => {
    // console.log(req.userData);
 Profile.findOne({user_id:req.params.userid})
        .populate('jobsApplied','jobId')
        .then(async result=>{
            let orgResumes = {};
            if(req.userData.userType=='recruiter'){
                orgResumes = await organisationController.getOrgResumes(req.userData.email);
            }
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
                    salaryperyear: result.salaryperyear,
                    salaryperhour: result.salaryperhour,
                    companyName: result.companyName,
                    jobsApplied: result.jobsApplied,
                    image:result.image,
                    videoUrl:result.videoUrl,
                },
                domain:{
                    resumesLeft:orgResumes['resumeDownloadLimit'] || 0,
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

router.post('/resumes',isRecruiter,(req, res, next)=>{
    if(req.userData['userType'] == 'applicant'){
        res.status(401).json({
            message:'Only recruiter can browse resumes',
        })
    }
    else{
        // console.log(req.body);
        let selectFilter = {'__v':0,'jobsApplied':0 , 'user_id':0 , 'resume':0, 'email':0,'phoneNumber':0};
        let skills = [RegExp(".*")];
        let skipR = 0;
        let sortFilter = {updated:-1}; // Newest by default

        if(req.body.sortBy){

            if(req.body.sortBy == "oldest"){
                sortFilter = {updated:1};
            }
        }

        if(req.body.page){
            try{
                skipR = ( (Number(req.body.page)>=1 ? Number(req.body.page) : 1) - 1) * 10;
            }catch(err){
                skipR = 0;
            }
        }

        if(req.body.skills && Array.isArray(req.body.skills)){
            if(req.body.skills.length){
                skills = []
                req.body.skills.forEach(skill => {
                    if(skill.trim()){
                        skills.push(RegExp(skill,"i"));
                    }
                });
            }
        }
        if(!skills.length){
            skills = [RegExp(".*")];
        }
        let expFilter = [{
            experience:{
                $gt:-1,
            }
        }]

        if(req.body.expCodes && Array.isArray(req.body.expCodes)){
            if(req.body.expCodes.length){
                expFilter=[]
                req.body.expCodes.forEach(code=>{
                    if(code==1){
                        expFilter.push({
                            experience:{
                                $gte:0,
                                $lte:12,
                            }
                        })

                    }else if(code == 2){
                        expFilter.push({
                            experience:{
                                $gte:12,
                                $lte:24,
                            }
                        })

                    }else if(code == 3){
                        expFilter.push({
                            experience:{
                                $gte:24,
                                $lte:36,
                            }
                        })
                        
                    }else if(code == 4){
                        expFilter.push({
                            experience:{
                                $gte:36,
                                $lte:60,
                            }
                        })
                        
                    }else if(code == 5){
                        expFilter.push({
                            experience:{
                                $gte:60,
                            }
                        })
                    }
                })

            }

        }
        if(expFilter.length==0){
            expFilter = [{
                experience:{
                    $gt:-1,
                }
            }]
        }
        User.findById(req.userData.userId).then(async user=>{
            if(!user){
                user={
                    resumedownloadlimit : 0
                }
            }
            let orgResumes = await organisationController.getOrgResumes(req.userData.email);
            let totalResumes = user.resumedownloadlimit + orgResumes['resumeDownloadLimit']
            if(totalResumes<1){
                selectFilter={'salaryperyear':1,'salaryperhour':1,'fullName':1,'skills':1,'region':1,'professionalTitle':1}
            }
            Profile.aggregate([
                {
                    $match: {
                        $or: expFilter,
                        type:{
                            $ne:"recuiter",
                        },
                        fullName:{
                            $nin:[null,undefined,''],
                        },
                        email:{
                            $nin:[null,undefined,''],
                        },
                        skills:{
                            $nin:[null,undefined,''],
                            $in:skills,
                        },
                        aboutMe:{
                            $nin:[null,undefined,''],
                        },
                        resume:{
                            $nin:[null,undefined,''],
                        },
                        professionalTitle:RegExp(req.body.keyword || '','i'),
                        region: RegExp(req.body.location || '','i')
                    }
                },
                {
                    $project:selectFilter,
                }
            ])
            .sort(sortFilter)
            .limit(15)
            .skip(skipR)
            .then(resumes=>{
                res.status(200).json({
                    message:"Resumes",
                    resumes : resumes,
                })
            })
        })
        
    }
});

function createPurchaseHistory(recruiterId,resumeId){
    let purhcase = new ResumePurchase({
        resume:resumeId,
        recruiterId: recruiterId,
        purchasedOn : new Date()
    })
    purhcase.save(
        function(err){
            if(err){
                console.log("Purchase Failed",err);
            }else{
                console.log("Purchase Successful");
            }
        }
    )
}

router.get('/resume/:id',isRecruiter,(req,res)=>{
    if(!req.params.id){
        res.status(403).json({
            message: 'No resume id provided',
        })
    }
    let recruiterId = req.userData.userId;
    let resumeId = req.params.id;
    ResumePurchase.findOne({
        resume: resumeId,
        recruiterId: recruiterId
    })
    .populate('resume')
    .then(purchase=>{
        if(purchase){
            return res.status(200).send({
                message:'Success',
                resume: purchase.resume.resume,
                email : purchase.resume.email,
            })
        }else{
            return res.status(404).send({
                message:'Not yet purchased',
            })
        }
    })
    .catch(err=>{
        return res.status(500).send({
            message:'Internal error',
        })
    })

})

router.post('/resume/:id',isRecruiter,(req,res,next)=>{
    if(!req.params.id){
        res.status(403).json({
            message: 'No resume id provided',
        })
    }
    let recruiterId = req.userData.userId;
    let resumeId = req.params.id;
    // console.log(recruiterId,resumeId);
    ResumePurchase.findOne({
        resume: resumeId,
        recruiterId: recruiterId
    })
    .populate('resume')
    .then(purchase=>{
        // // console.log("already purchased",purchase);
        if(purchase){
            return res.status(200).send({
                message:'Success',
                resume: purchase.resume.resume,
                email : purchase.resume.email,
            })
        }else{
            Profile.findById(resumeId)
            .then(resume=>{
                if(resume){
                    let promises = [];
                    promises[0] = User.findById(recruiterId);
                    promises[1] = organisationController.getOrgResumes(req.userData.email);
                    Promise.all(promises)
                    .then(results=>{
                        // console.log(results);
                        let orgResumes = results[1];
                        let orgResumesCount = orgResumes['resumeDownloadLimit'] || 0;
                        let user = results[0];
                        if(orgResumesCount>0){
                            // console.log(orgResumesCount);
                            organisationController.decrementResumeCountToDomain(req.userData.email)
                            .then(data=>{
                                createPurchaseHistory(recruiterId,resumeId);
                               res.status(201).json({
                                   message:"Success",
                                   resume:resume.resume,
                                   email:resume.email
                               })
                            }).catch(err=>{
                               res.status(500).json({
                                   message:"Something went wrong",
                               })
                            })
                        }else{
                            if(user.resumedownloadlimit<=0){
                                return res.status(403).json({
                                    message:"Purchase any plan to download resume",
                                })
                            }
                            User.findOneAndUpdate(
                            {
                                _id:recruiterId
                            },
                            {
                                $inc:{
                                    resumedownloadlimit:-1,
                                }
                            },
                            function(err,doc){
                                if(err){
                                    res.status(500).json({
                                        message:"Something went wrong",
                                    })
                                }
                                if(doc){
                                    
                                    if(!doc){
                                        return res.send(400).send({
                                            message:"User not found",
                                        })
                                    }
                                    createPurchaseHistory(recruiterId,resumeId);
                                    res.status(201).json({
                                        message:"Success",
                                        resume:resume.resume,
                                        email:resume.email
                                    })
                                }
                            })
                        }
                    })
                }else{
                    return res.status(404).send({
                        message:"Invalid Profile Id",
                    })
                }
            })
            .catch(err=>{
                res.status(500).send({
                    message:"Internal Error"
                })
            })
        }
    })
    // Profile.findById(req.params.id)
    // .then(resume=>{
    //     User.findById(req.userData.userId)
    //     .then(async (user)=>{
    //         let orgResumes = await organisationController.getOrgResumes(req.userData.email);
    //         let orgResumesCount = orgResumes['resumeDownloadLimit'] || 0;
    //         if(orgResumesCount>0){
    //          // console.log(orgResumesCount);
    //          organisationController.decrementResumeCountToDomain(req.userData.email)
    //          .then(data=>{
    //              // console.log('Downloaded from org resumes');
    //             res.status(201).json({
    //                 message:"Success",
    //                 resume:resume.resume,
    //             })
    //          }).catch(err=>{
    //             res.status(500).json({
    //                 message:"Something went wrong",
    //             })
    //          })
    //         }else{
    //             if(user.resumedownloadlimit<=0){
    //                 return res.status(403).json({
    //                     message:"Purchase any plan to download resume",
    //                 })
    //             }
    //             User.findOneAndUpdate(
    //             {
    //                 _id:req.userData.userId
    //             },
    //             {
    //                 $inc:{
    //                     resumedownloadlimit:-1,
    //                 }
    //             },
    //             function(err,doc){
    //                 if(err){
    //                     res.status(500).json({
    //                         message:"Something went wrong",
    //                     })
    //                 }
    //                 if(doc){
    //                     if(!doc){
    //                         return res.send(400).send({
    //                             message:"User not found",
    //                         })
    //                     }
    //                     res.status(201).json({
    //                         message:"Success",
    //                         resume:resume.resume,
    //                     })
    //                 }
    //             })
    //         }
    //     })
        
    // })
});

router.get('/all/all',(req,res)=>{
    Profile.find({})
    .then(profiles=>{
        res.send({
            data:profiles
        })
    })
});
router.get('/set/data',(req,res)=>{
    Profile.updateMany({
        type:{
            $ne:"recuiter",
        }
    },{
        $set:{
            professionalTitle:''
        }
    })
    .then(profiles=>{
        res.send({
            data:profiles
        })
    })
});

router.post("/resumesNew",(req,res,next)=>{
    // console.log(req.body);
    let selectFilter={'__v':0,'jobsApplied':0 , 'user_id':0 , 'resume':0};
    if(!req.body.resumedownloadlimit){
        selectFilter={'salaryperyear':1,'salaryperhour':1,'fullName':1,'skills':1,'region':1,'updated':1,'professionalTitle':1}
    }
    let sf = true // Salary filter
    let loc = req.body.loc || '';
    let title = req.body.title || '';
    let sortF = {};
    if(req.body.sortBy){
        if(req.body.sortBy=='latest'){
            sortF = {
                updated:'desc',
            }
        }else if(req.body.sortBy=='oldest'){
            sortF ="updated"

        }
    }
    let skills = (req.body.skills || '').split(",");
    // var x = ["sai","test","jacob","justin"],
    let regex = skills.map(function (e) { return new RegExp(e, "i"); });
    Profile.find({
        type:{
            $ne:"recuiter",
        },
        fullName:{
            $nin:[null,undefined,''],
        },
        email:{
            $nin:[null,undefined,''],
        },
        skills:{
            $nin:[null,undefined,''],
            $in:regex,
        },
        aboutMe:{
            $nin:[null,undefined,''],
        }
    })
        .select(selectFilter)
        .sort(sortF)
        .limit(10)
        .skip(0)
        .then(profiles=>{
            res.status(200).json({
                message:"Resumes",
                resumes : profiles,
            })  
        })
        .catch(err=>{
            // console.log(err);
            res.status(200).json({
                message:"error while retrieving resumes",
            })  
    })

});


router.patch('/:_id', (req, res, next) => {
    // console.log(req.body);

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
            // console.log(result);
            res.status(200).json(result);
        })
        .catch(err => {
            // console.log(err);
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

module.exports.routes = router;