var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const profileSchema = mongoose.Schema({

    fullName: {
        type: String
    },
    email: {
        type: String
    },
    region: {
        type: String
    },
    professionalTitle: {
        type: String
    },
    category: {
        type: String
    },
    user_id:{
        type:String,
        required:true,
        unique: true,
    },
    type:{
        type: String,
        enum:['applicant','recruiter'],
        default:'applicant',
    },
    //  category: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User
    // },
    skills: {
        type: String
    },
    url: {
        type: String
    },
    experience: {
        type: String
    },
    resume: {
        type: String
    },
    aboutMe: {
        type: String
    },
    education: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    salaryperyear: {
        type: Number,
        default:10000,
    },
    salaryperhour:{
        type:Number,
        default:15,
    },
    companyName: {
        type: String
    },
    videoUrl:{
        type: String
    },
    image:{
        type:String
    },
    jobsApplied:[{type:mongoose.Schema.Types.ObjectId, ref: 'JobAppSchema'}]

});

module.exports = mongoose.model('Profile', profileSchema);


// Education(optional)
// School Name
// Qualification(s)
// Start / end date



// Experience(optional)
// Employer
// Job Title
// Start / end date