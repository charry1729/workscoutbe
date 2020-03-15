var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const jobapplicationschema = mongoose.Schema({

    purchased:{
        type:Boolean,
        default: false,
    },
    resume:{
        type:String,
    },
    appliedOn:{
        type:Date,
        index:true,
    },

    applicationStatus:{
        type:String,
        enum:['NEW','INTERVIEWED','OFFER EXTENDED','HIRED','ARCHIVED'],
        default: 'NEW',
        index:true
    },

    rating:{
        type:Number,
        default:0,
        index:true,
    },

    note:{
        type:String,
    },

    applicantName:{
        type:String,
        index:true,
    },

    applicantEmail:{
        type:String,
    },

    applicantMessage:{
        type:String,

    },

    applicantProfile:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Profile'
    },

    jobId:{
        type:mongoose.Schema.Types.ObjectId ,ref: 'Job'
    }

});

module.exports = mongoose.model('JobAppSchema', jobapplicationschema);


// Education(optional)
// School Name
// Qualification(s)
// Start / end date



// Experience(optional)
// Employer
// Job Title
// Start / end date