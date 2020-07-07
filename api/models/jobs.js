var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const jobSchema = mongoose.Schema({

    //var jobSchema = new Schema({

    jobId: {
        type: String,
        index:true
    },
    name: {
        type: String
    },
    email:{
        type:String,
    },
    title: {
        type: String,
        index:true,
    },
    createdAt: {
        type: Date,
        required:true
    },
    closeDate:{
        type: Date
    },
    experience:{
        type: String,
    },
    createdBy: {
        //type: String
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index:true,
    },
    views:{
        type:Number,
        default:0
    },
    activeStatus: {
        type: String
    },
    primaryResponsibilities: {
        type: String
    },
    requirements: {
        type: String
    },

    description: {
        type: String
    },
    location: {
        type: String
    },
    jobType: {
        type: String,
        index:true,
    },
    url: {
        type: String
    },
    salaryType:{
        type: String,
        enum:['YEARLY','HOURLY'],
        default: 'YEARLY',
    },
    minimumrate: {
        type: Number
    },
    maximumrate: {
        type: Number
    },
    minimumsalary: {
        type: Number
    },
    currencysymbol:{
        type: String
    },
    maximumsalary: {
        type: Number
    },
    companyDetails: {
        type: String
    },
    companyName: {
        type: String
    },
    Website: {
        type: String
    },
    companyDescription: {
        type: String
    },
    filled:{
        type:Boolean,
        default: false
    },
    applicants:[{type:mongoose.Schema.Types.ObjectId, ref: 'JobAppSchema'}],


});

module.exports = mongoose.model('Job', jobSchema);