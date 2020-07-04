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
const organisation = require("../models/organisation");

function getOrgResumes(email){
    let domain = util.getDomain(email || '');
    domain = domain.toLowerCase();
    return Organisation.findOne({
        domain:domain
    }).then(organisation=>{
        if(!organisation){
            return ({
                message:"No organisation found!"
            })
        }
        return ({
            message:'Success',
            resumeDownloadLimit:organisation.resumeDownloadLimit
        })
    })
}
module.exports.getOrgResumes = getOrgResumes;
router.get('/resumes',isRecruiter,(req,res)=>{
    getOrgResumes(req.userData.email)
    .then(data=>{
        res.send(data)
    })
    .catch(err=>{
        console.log(err);
        res.status(500).send({
            message:"Server Error"
        })
    })
    // Organisation.findOne({
    //     domain:domain
    // }).then(organisation=>{
    //     if(!organisation){
    //         return res.status(400).send({
    //             message:"No organisation found!"
    //         })
    //     }
    //     res.status(200).send({
    //         message:'Success',
    //         resumeDownloadLimit:organisation.resumeDownloadLimit
    //     })
    // })
    // .catch(err=>{
    //     res.status(500).send({
    //         message:"Server Error"
    //     })
    // })
})

/**
 * @params email
 */
function createNewOrganisation(email){
    let domain = util.getDomain(email||'');
    domain = domain.toLowerCase();
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

function resetOrgResumes(req,res){
    Organisation.updateMany({},{
        $set:{
            resumeDownloadLimit : 3,
        }
    })
    .then(data=>{
        res.send("Completed");
    })
    .catch(err=>{
        res.status(500).send("Error Occured");
    })
}
router.get('/reset',resetOrgResumes);

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

function decrementResumeCountToDomain(email){
    let domain = util.getDomain(email || '').toLowerCase();
    console.log("Called Decre org resumes");
    console.trace();
    return Organisation.findOne({
        domain:domain
    }).then(data=>{
        return Organisation.update({
            domain:domain,
        },{
            $set:{
                resumeDownloadLimit: data.resumeDownloadLimit - 1,
            }
        })
    })
}
module.exports.decrementResumeCountToDomain = decrementResumeCountToDomain;

module.exports.routes = router;