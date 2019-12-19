const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/check-auth");

const User = require('../models/users');
const Profile = require("../models/profile")

router.get("/all",(req,res,next)=>{
    User.find().then((data)=>{
        res.status(200).json({
            users : data,
        })
    })
})

router.post('/signup', (req, res, next) => {
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "email already exists"
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
                            email: req.body.email,
                            password: hash,
                            name: req.body.username,
                            userType: req.body.type,
                        });
                        user.save()
                            .then(result => {

                                console.log(result);
                                const profile = new Profile({
                                    _id : new mongoose.Types.ObjectId(),
                                    user_id: result._id,
                                });
                                profile.save()
                                        .then(result =>{
                                            console.log(result);
                                            res.status(201).json({
                                                message: 'User Created',
                                            });
                                        })
                                        .catch(err=>{
                                            res.status(500).json({
                                                error : err,
                                            })
                                        })
                                
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

router.post('/changePassword', checkAuth,(req, res, next) => {
    User.findOne({
            _id: req.body._id
        })
        .exec()
        .then(user => {
            
                bcrypt.compare(req.body.password, user.password, (err, result) => {
                    if (err) {
                        res.status(500).json({
                            error: err,
                            message: "Old password was given wrong",
                        });
                    } 
                    if(result){
                        if(req.body.new_password){

                        }
                    }
                    
                    // else {
                    //     const user = new User({
                    //         _id: new mongoose.Types.ObjectId(),
                    //         email: req.body.email,
                    //         password: hash,
                    //         name: req.body.username,
                    //         userType: req.body.type,
                    //     });
                    //     user.save()
                    //         .then(result => {
                    //             console.log(result);
                    //             res.status(201).json({
                    //                 message: 'User Created',
                    //             });
                    //         })
                    //         .catch(err => {
                    //             res.status(500).json({
                    //                 error: err
                    //             });
                    //         });
                    // }
                });


            
        });

});


router.post('/login', (req, res, next) => {
    console.log("body  : ", req.body);

    User.findOne({
            email: req.body.email
        })
        .exec()
        .then(user => {
            console.log("user", user);

            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth Failed1'
                });
            }
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth Failed2'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user.email,
                            //                            userId: user._id
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
                    });
                }
                res.status(401).json({
                    message: 'Auth Failed3'
                });
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
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
module.exports = router;