import jwt from 'jsonwebtoken';
require('dotenv').config();

export default (req,res,next)=>{
     const header = req.headers.authorization;
     let token;

     if(header) token = header.split(' ')[1];

     if(token){
        jwt.verify(token, process.env.JWT_SECRETKEY,(err,decoded)=>{
            if(err){
                res.status(401).json({errors:{global:"invalid token"}});
            }else{
                next();
            }
        });
     }else{
         res.status(401).json({ errors: { global: "No token" } });
     }
}