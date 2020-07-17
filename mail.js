const sgMail = require('@sendgrid/mail');
const { subDays } = require('./util');
const User = require('./api/models/users');
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_KEY);
const VERIFY_TEMPLATE = process.env.TEMPLATE_ID;
const FORGET_PASSWORD_TEMPLATE = process.env.FORGET_PASSWORD_TEMPLATE;
const APPLICANT_APPLIED_TEMPLATE = process.env.APPLICANT_APPLIED_TEMPLATE;
const RECRUITER_JOB_NOTIFY = process.env.RECRUITER_JOB_NOTIFY;

// Mail Cnfig Tester
// (function (){
//     if(SENDGRID_KEY && VERIFY_TEMPLATE && FORGET_PASSWORD_TEMPLATE && APPLICANT_APPLIED_TEMPLATE && RECRUITER_JOB_NOTIFY){
//         console.log("Mail setup done")
//     }else{
//         throw new Error ("Mail Setup Failed");
//     }
// })();

function verifyEmail(to,body_data){
    return new Promise((succes,fail)=>{
        const msg = {
            to: to,
            from: 'verify@placementbridge.com',
            templateId: VERIFY_TEMPLATE,
            dynamic_template_data: body_data
          };
        sgMail.send(msg, (error, result) => {
            if (error) {
                fail(error);
            } else {
                succes(result);
                
            }
          });
    })
}
module.exports.verifyEmail = verifyEmail;

function forgotPasswordMail(to,body_data){
    return new Promise((succes,fail)=>{
        const msg = {
            to: to,
            from: 'resetpassword@placementbridge.com',
            templateId: FORGET_PASSWORD_TEMPLATE,
            dynamic_template_data: body_data
          };
        sgMail.send(msg, (error, result) => {
            if (error) {
                fail(error)
            } else {
               succes(result)
            }
        });
    })

}
module.exports.forgotPasswordMail = forgotPasswordMail;

function notifyApplicant(to,body_data){
    return new Promise((succes,fail)=>{
        const msg = {
            to: to,
            from: 'notification@placementbridge.com',
            templateId: APPLICANT_APPLIED_TEMPLATE,
            dynamic_template_data: body_data
          };
        sgMail.send(msg, (error, result) => {
            if (error) {
                fail(error)
            } else {
               succes(result)
            }
        });
    })
}
module.exports.notifyApplicant = notifyApplicant;

function notifyRecruiter(to,body_data){
    return new Promise((succes,fail)=>{
        const msg = {
            to: to,
            from: 'notification@placementbridge.com',
            templateId: RECRUITER_JOB_NOTIFY,
            dynamic_template_data: body_data
          };
        sgMail.send(msg, (error, result) => {
            if (error) {
                fail(error)
            } else {
               succes(result)
            }
        });
    })
}
module.exports.notifyRecruiter = notifyRecruiter;

function sendJobApplyMails(job,profile){
    if(job && profile){
        let applicantMailData = {};
        let recruiterMailData = {};
        // Sending Mails to applicant and recruiter
        // Applicant Mail Data
        applicantMailData['job_position'] = job['title']
        applicantMailData['company_name'] = job['companyName']
        User.findById(profile['user_id'])
        .then(user=>{
            if(!user){
                console.log("No applicant mail found");
                return;
            }
            notifyApplicant(user.email,applicantMailData);
        })
        .catch(err=>{
            console.log("Applicant mail failed");
        })

        // Recruiter Mail Data
        recruiterMailData={
            'job_name':job['title'],
            'job_position':job['primaryResponsibilities']
        }
        User.findById(job['createdBy'])
        .then(user=>{
            if(!user){
                console.log("No recruiter mail found");
                return;
            }
            notifyRecruiter(user.email,recruiterMailData);
        })
        .catch(err=>{
            console.log("Recruiter mail failed");
        })
    }else{
        return;
    }

}
module.exports.sendJobApplyMails = sendJobApplyMails;