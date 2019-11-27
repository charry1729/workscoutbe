const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");
const Job = require("../models/jobs");

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

router.get("/", (req, res, next) => {
    Job.find()
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
                            Requirements: docs.Requirements,
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
                                url: "http://localhost:3000/job/" + docs._id
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
    console.log(req.body);

    console.log("----");

    const job = new Job({
        _id: new mongoose.Types.ObjectId(),
        // _id: new mongoose.Types.ObjectId(),
        //        jobId: docs._id,
        name: req.body.name,
        title: req.body.title,
        //       createdAt: Date(),
        createdBy: req.body.createdBy,
        activeStatus: req.body.activeStatus,
        primaryResponsibilities: req.body.primaryResponsibilities,
        Requirements: req.body.Requirements,
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
        companyDescription: req.body.companyDescription
        // name: req.body.name,
        // price: req.body.price,
        // productImage: req.file.path
    });
    job
        .save()
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
                    Requirements: result.Requirements,
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
                        url: "http://localhost:3000/job/" + result._id
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

router.get("/:_id", async (req, res, next) => {
    //   const ID = req.params.jobId;
    //  console.log(ID);
    //   const job1 = await Job.findById(req.params.jobId)
    Job.findById(req.params._id)
        .populate("profile")
        .exec()
        .limit(5)
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
                        url: "http://localhost:3000/job/" + doc._id
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
    //                     url: 'http://localhost:3000/job'
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
                        url: "http://localhost:3000/job/" + req.params.createdBy
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



module.exports = router;