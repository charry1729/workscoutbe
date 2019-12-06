const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require("../middleware/check-auth");

const User = require('../models/users');

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
                                res.status(201).json({
                                    message: 'User Created',
                                });
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
    User.find({
            _id: req.body._id
        })
        .exec()
        .then(user => {
            
                bcrypt.compare(req.body.password, user[0].password, (err, result) => {
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
    User.find({
            email: req.body.email
        })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth Failed'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY, {
                            expiresIn: "10d"
                        }
                    );
                    return res.status(200).json({
                        message: "Auth Successful",
                        token: token,
                        userId: user[0]._id,
                        result: result,
                        name: user[0].name,
                        email:user[0].email,
                        type: user[0].userType,
                    });
                }
                res.status(401).json({
                    message: 'Auth Failed'
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