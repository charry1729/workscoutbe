const jwt =require('jsonwebtoken');

module.exports = (req,res,next)=>{
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token,process.env.JWT_KEY);
    if(decoded.userType == "applicant"){
        req.userData = decoded;
    }else{
        throw Error;
    }
    if(!decoded.verify){
      return res.status(401).json({
        message:"You need to verify email"
      })
    }
    next();

  }  catch(error){
        return res.status(401).json({
            message : 'Not Allowed',
        });
  }
    
};