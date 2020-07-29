const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/check-auth");
const schedule = require("node-schedule");
const Organisation = require('../models/organisation');
const organisationController = require('./organisation');
const User = require('../models/users');
const Profile = require("../models/profile")
const mail = require("../../mail");
const sgMail = require('@sendgrid/mail');
const multer = require("multer");
const excel = require('../excel');
const http = require('http');
const url = require('url');
const DOWNLOAD_DIR = './uploads/';
const fs = require('fs');
const { fail } = require("assert");
const process = require('process');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const tempID = process.env.TEMPLATE_ID;
const FTID = process.env.FORGET_PASSWORD_TEMPLATE; //Forgot password email template


const SERVER_IP_WO_PORT = process.env.SERVER_IP_WO_PORT;

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

const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});

function ValidateEmail(mail)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
        return (true)
    }
        // alert("You have entered an invalid email address!")
        return (false)
}

router.get("/all",(req,res,next)=>{
    User.find().then((data)=>{
        res.status(200).json({
            users : data,
        })
    })
})

router.post('/sendMail',(req,res,next)=>{
    User.find({
        email:req.body.email,
    }).then(user=>{
        if(user.length==0){
            return res.status(404).json({
                message:"Email is not registered",
            })
        }
        console.log(user[0].verified);
        if(user[0].verified){
            return res.status(200).json({
                message:"Email already verified",
            })
        }
        bcrypt.hash(req.body.email,10,(err,hash)=>{
            if(err){
                res.status(500).json({
                    error : err,
                })
            }
            if(hash){
                console.log(user);
                console.log("http://"+SERVER_IP_WO_PORT+"/verify.html?id="+user[0].id+"&hash="+hash);
                console.log("http://"+SERVER_IP_WO_PORT+"/verify.html?id="+user[0]._id+"&hash="+hash)
                let body_data = {
                    sample_name:req.body.username,
                    verify_url:"http://"+SERVER_IP_WO_PORT+"/verify.html?id="+user[0].id+"&hash="+hash,
                }
                mail.verifyEmail(req.body.email,body_data)
                .then(data=>{
                    res.status(201).json({
                        message: 'Email sent for verification',
                    });
                })
                .catch(err=>{
                    res.status(500).json({
                        message:'Error occured try again later',
                    })
                })
            }
        })

    })
});

router.post('/signup', (req, res, next) => {
    
    if(!ValidateEmail(req.body.email)){
        res.status(422).json({
            message:"Invalid data",
        })
        return;
    }

    var email = req.body.email;
    //changing email domain part to lowercase
    email = email.split('@')[0]+ '@' + email.split('@')[1].toLowerCase();

    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Email already taken"
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: email,
                            password: hash,
                            name: req.body.username,
                            userType: req.body.type,
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                bcrypt.hash(email,10,(err,hash)=>{
                                    if(err){
                                        res.status(500).json({
                                            error : err,
                                        })
                                    }
                                    if(hash){
                                        let body_data = {
                                            sample_name:req.body.username,
                                            verify_url:"http://"+SERVER_IP_WO_PORT+"/verify.html?id="+result.id+"&hash="+hash,
                                        }
                                        mail.verifyEmail(email,body_data)
                                        .then(data=>{
                                            res.status(201).json({
                                                message: 'Email sent for verification',
                                            });
                                        }).catch(err=>{
                                            res.status(500).json({
                                                message:'Error occured try again later',
                                            })
                                        })
                                    }
                                })
                                const profile = new Profile({
                                    _id : new mongoose.Types.ObjectId(),
                                    user_id: result._id,
                                    type:result.userType,
                                    updated: new Date(),
                                });
                                profile.save()
                                
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                });


            }
        });

});

router.get('/getHash/:id',(req,res,next)=>{
    console.log(req.body);
    console.log(req.params.id)
    User.findById(req.params.id)
        .then(user=>{
            console.log(user.email);
            bcrypt.hash(user.email,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        message:'Server error! Try again later',
                    })
                }
                if(hash){
                    return res.status(200).json({
                        message:'Success',
                        hash:hash,
                    })
                }
            })


        })
        .catch(err=>{
            return res.status(500).json({
                message:'Server error! Try again later',
            })
        })

});

router.post("/verify",(req,res,next)=>{

    User.findById(req.body.id).then(user=>{
        let email = user.email;
        if(user.verified){
            return res.status(200).json({
                message:"already verified",
            })
        }

        bcrypt.compare(email,req.body.hash,(err,result)=>{

            if(err){
                return res.status(500).json({
                    message:'Server error! Try again later',
                })
            }

            if(result){
                let tasks = [];

                tasks[0] = User.findOneAndUpdate({
                    _id:req.body.id,
                },{
                    $set:{
                        verified: true,
                    }
                },function(err,doc){
                    if(err){
                        return {
                            message:'Server error! Try again later',
                        }
                    }
                    if(doc){
                        return {
                            message:"Verification Successful",
                        }
                    }
                })
                if(user.userType == 'recruiter'){
                    tasks[1] = organisationController.createNewOrganisation(user.email);
                }
                Promise.all(tasks)
                .then(results=>{
                    res.send({
                        message: results[0].message
                    })
                })
                .catch(err=>{
                    res.status(400).send({
                        message:"An error occured please try again later!!"
                    })
                })
            }
        })
    }).catch(err=>{
        return res.status(500).json({
            message:'Not valid request',
        })
    })

});

router.get("/addResumes/:id",(req,res,next)=>{

    User.findOneAndUpdate({
        _id:req.params.id,
    },{
        $set:{
            resumedownloadlimit:10,
        }
    }).then(usr=>{
        res.status(200).json({
            message:"done"
        })
    })
})

router.post('/changePassword', checkAuth,(req, res, next) => {
    User.findOne({
            _id: req.body._id
        })
        .then(user => {
            console.log("Found user");
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                console.log("In compare success")
                console.log(err,result);
                if (err) {
                    res.status(500).json({
                        error: err,
                        message: "Old password was given wrong",
                    });
                    return;
                }
                if(result){
                    console.log("In compare success")
                    if(req.body.new_password){

                        bcrypt.hash(req.body.new_password, 10, (err, hash) => {
                            if(err){
                                res.status(500).json({
                                    message:"Hash not working",
                                })
                                return;
                            }
                            if(hash){
                                User.findOneAndUpdate(
                                    {
                                        _id: req.body._id
                                    },
                                    {
                                        $set:{
                                            password:hash,
                                        }
                                    },
                                    function(err,doc){
                                        if(err){
                                            res.status(500).json({
                                                message:'User updation failed',
                                            })
                                        }
                                        if(doc){
                                            res.status(200).json({
                                                message:"Password successfully changed",
                                            })
                                        }
                                    })
                            }
                        })
                        
                    }else{
                        res.status(404).json({
                            message:'Password Missing',
                        })
                    }
                }else{
                    res.status(403).json({
                        message:"Old password did'nt match",
                    });
                }
            });
        })
        .catch(err=>{
            res.status(403).json({
                message:'Updation failed',
            })
        })

});


router.post('/login', (req, res, next) => {
    if(!ValidateEmail(req.body.email)){
        return res.status(422).json({
            message:"Invalid Data"
        })
    }
    User.findOne({
            email: req.body.email
        })
        .then(user => {
            // console.log("user", user);
            if( ! user.verified){
                return res.status(401).json({
                    message:'Email not verified yet',
                    verified:false,
                })
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Incorrect password',
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user.email,
                            userType : user.userType,
                            userId: user._id,
                            verified:user.verified,
                            resumedownloadlimit: user.resumedownloadlimit,
                            name:user.name
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "10d"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth Successful",
                        token: token,
                        userId: user._id,
                        result: result,
                        name: user.name,
                        email:user.email,
                        type: user.userType,
                        resumedownloadlimit:user.resumedownloadlimit,
                    });
                }
                res.status(401).json({
                    message: 'Incorrect credentials'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                message:"Incorrect credentials"
            });
        });
});

router.delete('/:userId', (req, res, next) => {
    User.remove({
            _id: req.params.userId
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
})

router.post('/forgot/password',(req,res,next)=>{
    User.find({
        email:req.body.email,
    }).then(user=>{
        console.log(user);
        if(user.length==0){
            return res.status(404).json({
                message:"Email is not registered",
            })
        }
        console.log(FTID);
        bcrypt.hash(user[0].password,10,(err,hash)=>{
            if(err){
                res.status(500).json({
                    error : err,
                })
            }
            if(hash){
                let body_data ={
                    sample_name:user[0].name || 'User',
                    verify_url:"http://"+SERVER_IP_WO_PORT+"/reset-password.html?id="+user[0].id+"&hash="+hash,
                }
                mail.forgotPasswordMail(req.body.email,body_data)
                .then(data=>{
                    res.status(201).json({
                        message: 'Reset Password link sent to your email ',
                    });
                })
                .catch(err=>{
                    res.status(500).json({
                        message:'Error occured try again later',
                    })
                })
            }
        })

    }).catch(err=>{
        res.status(500).json({
            message:err.message,
        })
    })
});

router.post("/reset/password",(req,res,next)=>{
    if(!req.body.new_password || !req.body.id){
        return res.status(400).json({
            message:"Invalid password",
        })
    }
    User.findById(req.body.id).then(user=>{
        if(!user){
            return res.status(404).json({
                message:"User not found",
            })
        }
        let password = user.password;

        bcrypt.compare(password,req.body.hash,(err,result)=>{

            if(err){
                return res.status(500).json({
                    message:'Server error! Try again later',
                })
            }

            if(result){
                bcrypt.hash(req.body.new_password, 10, (err, hash) => {
                    if(err){
                        res.status(500).json({
                            message:"Hash not working",
                        })
                        return;
                    }
                    if(hash){
                        User.findOneAndUpdate(
                            {
                                _id: req.body.id
                            },
                            {
                                $set:{
                                    password:hash,
                                }
                            },
                            function(err,doc){
                                if(err){
                                    res.status(500).json({
                                        message:'Password updation failed',
                                    })
                                }
                                if(doc){
                                    res.status(200).json({
                                        message:"Password updated successfully",
                                    })
                                }
                            })
                    }
                })

            }
        })
    }).catch(err=>{
        return res.status(500).json({
            message:'Not valid request',
        })
    })

})

router.get('/getInfo',checkAuth,(req,res)=>{
    User.findOne({
        _id:req.userData.userId
    }).then(user=>{
        console.log(user);
        if(user){
            res.status(200).send({
                message:"Success",
                user:{
                    resumedownloadlimit: user.resumedownloadlimit,
                }
            })
        }else{
            res.status(400).send({
                message:"User not found",
            })
        }
    })
})

router.get('/setZero/resumes',(req,res)=>{
    let userId = req.query.userId || 'some';
    console.log(req.query)
    console.log(userId);
    User.findOneAndUpdate({
        _id:userId,
    },{
        $set:{
            resumedownloadlimit:0,
        }
    },function(err,doc){
        if(err){
            res.send("Failed")
        }else{
            res.send("Done")
        }
    })
})

let importMapper ={
    'name': 'name',
    'email':'email',
    'aboutme': 'aboutMe',
    'phone' : 'phoneNumber',
    'expectedpayperhour' : 'salaryperhour',
    'expectedpayperyear' : 'salaryperyear',
    'country':'country',
    'experience(inmonths)':'experience',
    'jobtype':'category',
    'location':'region',
    'resume':'resume',
    'skills':'skills',
}

function download(file_url) {
    return new Promise((done,fail)=>{
        file_url = encodeURI(file_url)
        var options = {host: url.parse(file_url).host, port: 80, path: url.parse(file_url).pathname},
        file_name = url.parse(file_url).pathname.split('/').pop(),
        file_name = decodeURI(file_name);
        //Creating the file
            file = fs.createWriteStream(DOWNLOAD_DIR + file_name, {flags: 'w', encoding: 'binary'});

        console.log('Downloading file from ' + file_url);
        console.log('\tto ' + file_name);
        http.get(options, function (res) {
            res.pipe(file, {end: 'false'});
            //When the file is complete
            res.on('end', function () {
                //Closing the file
                file.end();
                console.log('\t\tDownloaded '+ file_name);
                // callback(DOWNLOAD_DIR + file_name);
                done(DOWNLOAD_DIR + file_name);
            });
        });

        process.on('uncaughtException', function(err) {
            // console.log('Can t download ' + file_url + '\t(' + err + ')', false);
            // callback(null);
            fail();
        });
    })
}

router.post('/import/records', uploads.single('file') ,async (req,res)=>{
    if(!req.file){
        return res.status(401).send({
            message:"Invalid Request"
        })
    }
    let downloadUrl = "http://34.224.1.240/resumes/";
    let records = excel.parseXL(req.file.path);
    for(let i in records){
        let row = records[i];
        let record = {};
        for(let k in importMapper){
            if(row[k]){
                record[importMapper[k]] = row[k];
            }
        }
        await new Promise((success,failed)=>{
            User.findOne({
                email:(record['email'] || '').toLowerCase()
            }).then(user=>{
                if(user){
                    success();
                    return;
                }
                let password = record['name'].toLowerCase().replace(/ /g,'') + 123;
                bcrypt.hash(password,10, (err,hash)=>{
                    if (err) {
                        failed()
                    } else {
                        let user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: record['email'].toLowerCase(),
                            password: hash,
                            name: record['name'],
                            userType: 'applicant',
                            verified: true
                        });
                        user.save()
                        .then(async result=>{
                            let fileName = randomName(15);
                            await download(downloadUrl+record['resume'])
                            .then(async downloadedFilePath=>{
                                let type = downloadedFilePath.split('.')
                                type = type[type.length-1];
                                let newFileName = fileName + '.'+ type;
                                let newFilePath = DOWNLOAD_DIR+ newFileName;
                                await fs.rename(downloadedFilePath, newFilePath, ()=>{} );
                                const profile = new Profile({
                                    _id : new mongoose.Types.ObjectId(),
                                    user_id: result._id,
                                    type:result.userType,
                                    updated: new Date(),
                                    fullName: record['name'],
                                    email: record['email'],
                                    region: record['region'],
                                    category: record['category'],
                                    skills: record['skills'],
                                    experience: record['experience'],
                                    resume: 'uploads/'+newFileName, //upload file 
                                    aboutMe: record['aboutMe'],
                                    phoneNumber:  record['phoneNumber'],
                                    salaryperyear: record['salaryperyear'],
                                    salaryperhour: record['salaryperhour'],
                                    updated: new Date(),
                                });
                                profile.save()
                                .then(()=>{
                                    console.log("Successfully created account and resume for ", record['email']);
                                    success();
                                })
                            })
                        })
                    }
                })
            }).catch(err=>{
                failed();
            })

        })
    }
    // records.forEach(async row=>{
        
    // })
    res.send("Done");
})

module.exports.routes = router;