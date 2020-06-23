const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/check-auth");
const schedule = require("node-schedule");

const User = require('../models/users');
const Profile = require("../models/profile")
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const tempID = process.env.TEMPLATE_ID;
const FTID = process.env.FORGET_PASSWORD_TEMPLATE; //Forgot password email template

let i=1;
// var j = schedule.scheduleJob("test",'* * * * *', function(){
//     console.log('The answer to life, the universe, and everything! '+i);
//     i++;
//   });

const SERVER_IP_WO_PORT = "34.224.1.240";
// const SERVER_IP_WO_PORT = "localhost";


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
                console.log("http://"+SERVER_IP_WO_PORT+"/workscout/HTML/verify.html?id="+user[0].id+"&hash="+hash);
                console.log("http://"+SERVER_IP_WO_PORT+"/workscout/HTML/verify.html?id="+user[0]._id+"&hash="+hash)
                const msg = {
                    to: req.body.email,
                    from: 'verify@workscout.com',
                    templateId: tempID,
                    dynamic_template_data: {
                        sample_name:req.body.username,
                        verify_url:"http://"+SERVER_IP_WO_PORT+"/workscout/HTML/verify.html?id="+user[0].id+"&hash="+hash,
                    }
                  };
                sgMail.send(msg, (error, result) => {
                    if (error) {
                        res.status(500).json({
                            message:'Error occured try again later',
                        })
                    } else {
                        res.status(201).json({
                            message: 'Email sent for verification',
                        });
                    }
                  });
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
                                        const msg = {
                                            to: email,
                                            from: 'verify@workscout.com',
                                            templateId: tempID,
                                            dynamic_template_data: {
                                                sample_name:req.body.username,
                                                verify_url:"http://"+SERVER_IP_WO_PORT+"/workscout/HTML/verify.html?id="+result.id+"&hash="+hash,
                                            }
                                          };
                                        sgMail.send(msg, (error, result) => {
                                            if (error) {
                                                console.log(error);
                                                res.status(500).json({
                                                    message:'Error occured try again later',
                                                })
                                            } else {
                                    
                                                // console.log(result);
                                                console.log("Successfully sent");
                                                res.status(201).json({
                                                    message: 'Email sent for verification',
                                                });
                                            }
                                          });
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
            // console.log(hash);

            if(result){
                // if(hash == req.body.hash){
                    User.findOneAndUpdate({
                        _id:req.body.id,
                    },{
                        $set:{
                            verified: true,
                        }
                    },function(err,doc){
                        if(err){
                            return res.status(500).json({
                                message:'Server error! Try again later',
                            })
                        }
                        if(doc){
                            return res.status(200).json({
                                message:"Verification Successful",
                            })
                        }
                    })
                // }
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
                console.log(user);
                console.log("http://"+SERVER_IP_WO_PORT+"/workscout/HTML/reset-password.html?id="+user[0].id+"&hash="+hash);
                console.log("http://"+SERVER_IP_WO_PORT+"/workscout/HTML/reset-password.html?id="+user[0]._id+"&hash="+hash)
                const msg = {
                    to: req.body.email,
                    from: 'resetpassword@workscout.com',
                    templateId: FTID,
                    dynamic_template_data: {
                        sample_name:user[0].name || 'User',
                        verify_url:"http://"+SERVER_IP_WO_PORT+"/workscout/HTML/reset-password.html?id="+user[0].id+"&hash="+hash,
                    }
                  };
                sgMail.send(msg, (error, result) => {
                    if (error) {
                        res.status(500).json({
                            message:'Error occured try again later',
                        })
                    } else {
                        res.status(201).json({
                            message: 'Reset Password link sent to your email ',
                        });
                    }
                });
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

module.exports = router;