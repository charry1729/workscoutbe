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
const util = require('../../util');

router.get('/resumes',isRecruiter,(req,res)=>{
    let domain = util.getDomain(req.userData.email || '');
    Organisation.findOne({
        domain:domain
    }).then(organisation=>{
        if(!organisation){
            return res.status(400).send({
                message:"No organisation found!"
            })
        }
        res.status(200).send({
            message:'Success',
            resumeDownloadLimit:organisation.resumeDownloadLimit
        })
    })
    .catch(err=>{
        res.status(500).send({
            message:"Server Error"
        })
    })
})

/**
 * @params email
 */
function createNewOrganisation(email){
    let domain = util.getDomain(email||'');
    return new Promise((resolve,reject)=>{
        Organisation.findOne({
            domain:domain
        }).then(organisation=>{
            if(organisation){
                console.log(domain,organisation);
                resolve();
            }else{
                let newOrganisation = new Organisation({
                    domain:domain,
                    resumeDownloadLimit:3
                })
                newOrganisation.save();
                resolve();
            }
        })
    })
}
module.exports.createNewOrganisation = createNewOrganisation;


function getAllOrganisations(req,res){
    console.log("In func")
    Organisation.find({})
    .then(orgs=>{
        res.send({
            data:orgs
        })
    })

}
router.get('/all',getAllOrganisations);

module.exports.routes = router;