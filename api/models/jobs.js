var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const jobSchema = mongoose.Schema({

    //var jobSchema = new Schema({

    jobId: {
        type: String
    },
    name: {
        type: String
    },
    title: {
        type: String
    },
    createdAt: {
        type: Date
    },
    createdBy: {
        //type: String

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
        type: String
    },
    url: {
        type: String
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
    }


});

module.exports = mongoose.model('Job', jobSchema);