var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/* Mongoose schema for user */
var contactSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    message: {
        type: String
    }
});

module.exports = mongoose.model("Contact", contactSchema);