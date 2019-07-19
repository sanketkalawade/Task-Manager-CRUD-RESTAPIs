const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const auth = async (req,res,next)=>{
   try {       
       const token = req.header('Authorization').replace('Bearer ','');
       const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
      // console.log(decoded);
       const user = await  User.findOne({_id:decoded._id, 'tokens.token':token})
       
       if (!user) {
           throw new Error();
       }
       req.token = token;
       req.user = user;
       
       next();
   } catch (error) {
       res.status(401).send('Invalid authorization, Please authorize!')
   }
}

module.exports = auth;