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
const Organisation = require('../models/organisation');
const organisationController = require('../routes/organisation');
const util = require('../../util');



function createMissingOrgs(req,res){
    User.find({
        userType : 'recruiter'
    })
    .select({
        '_id':0,
        'email':1
    })
    .then(emails=>{
        let domains = new Set()
        emails.forEach(email=>{
            console.log(email.email)
            domains.add(util.getDomain(email.email));
        })
        domains = [...domains];
        domains.forEach(domain=>{
            organisationController.createNewOrganisation('test@'+domain);
        })
        res.send({
            data:[...domains],
            emails:emails,
        })
    })

}
router.get('/createMissingOrgs',createMissingOrgs);


module.exports.routes = router;