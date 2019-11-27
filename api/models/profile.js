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
    //  category: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User'
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
        type: Number
    },
    salary: {
        type: Number
    },
    companyName: {
        type: String
    }

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