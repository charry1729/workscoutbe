var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const resumepurchaseschema = mongoose.Schema({

    resume:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Profile',
        index:true
    },
    recruiterId:{
        type:mongoose.Schema.Types.ObjectId, ref: 'Profile',
        index:true
    },
    purchasedOn:{
        type:Date,
    }

});

module.exports = mongoose.model('ResumePurchaseSchema', resumepurchaseschema);