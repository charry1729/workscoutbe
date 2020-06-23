var mongoose = require('mongoose');
//var Schema = mongoose.Schema;
const paymentSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    payment_intent_id:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Payment', paymentSchema);