var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const organisationSchema = mongoose.Schema({
    domain:{
        type: String,
        index: true,
    },
    resumeDownloadLimit:{
        type: Number,
        default: 0
    },

});

module.exports = mongoose.model('Organisation', organisationSchema);