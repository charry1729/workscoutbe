var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

/* Mongoose schema for user */
var userSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index:true
  },
  password: {
    type: String,
    default: "",
    required: true
  },
  userType: {
    type: String,
    enum:['applicant','recruiter'],
    default:'applicant',
  },
  name:{
    type: String,
    required: true,
  },
  resumedownloadlimit:{
   type: Number, default: 0 
  },
  expirationdate:{
    type:Date,
    default:null
  },
  verified:{
    type:Boolean,
    default:false,
  },
});

module.exports = mongoose.model("User", userSchema);

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};
