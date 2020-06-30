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
        type: String,
        default:''
    },
    professionalTitle: {
        type: String,
        default:''
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
    skills: {
        type: String,
        index:true,
    },
    url: {
        type: String
    },
    experience: {
        type: Number,
        default:0,
        index:true
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
    updated:{
        type:Date,
        index: true,
    },
    jobsApplied:[{type:mongoose.Schema.Types.ObjectId, ref: 'JobAppSchema'}]

});

module.exports = mongoose.model('Profile', profileSchema);