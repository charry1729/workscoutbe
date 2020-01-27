const jwt =require('jsonwebtoken');

module.exports = (req,res,next)=>{
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token,process.env.JWT_KEY);
    if(decoded.userType == "applicant"){
        req.userData = decoded;
        next();
    }else{
        throw Error;
    }
  }  catch(error){
        return res.status(401).json({
            message : 'Not Allowed',
        });
  }
    
};