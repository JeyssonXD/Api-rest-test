import express from "express";
import user from "../database/models/user";
import bcrypt from "bcryptjs";
import { sendConfirmationEmail,sendResetPasswordEmail } from "../helper/mailer.js";
import jwt from 'jsonwebtoken';
require('dotenv').config();

const router = express.Router();

//login
router.route("/auth").post((req,res)=>{
  user.where({email:req.body.credentials.email}).fetch().then(function(user) {
    if(user && user.isValidPassword(req.body.credentials.password)){
      console.log(user.auth());
      res.status(200).json({user:user.auth()});
    }else{
      res.status(500).json({errors:{global: "user/password incorrect"}});
    }
  }).catch((error)=>{console.log(error);res.status(500).json({errors:{global: "went wrong, sorry"}});});
});

//singup
router.route("/signup").post(async(req,res,next)=>{
    try {
      const {  errors,isValid } =  validate(req.body.data);
      if(isValid){
        const { email,password } = req.body.data;
        let userDB = await user.where({email:email}).fetch();
        if(userDB!=null){
          return res.status(400).json({errors:{global: "don't available email"}});
        }
        var passwordHash = bcrypt.hashSync(password,8);
        var newUser = new user({email:email,password:passwordHash,emailConfirmed:false})
        newUser.setConfirmationToken();
        let userBd = await newUser.save(null, {method: 'insert'});
        sendConfirmationEmail(userBd);
        res.status(200).json({user:userBd.auth()});
      }else{
        res.status(400).json({errors})
      }
    }  catch (e) {
      res.status(500).json({
          errors:{
            global: "sorry, "+ e
          }
        })
    }
});

//confirmation account
router.route("/confirmation").post(async(req,res,next)=>{
  try{

    const token = req.body.token;

    let userDB = await user.where({confirmationToken:token}).fetch();

    if(!!userDB){
      
      user.where({confirmationToken:token})
      .save({ confirmationToken : null, emailConfirmed : true}, {patch: true})
      .then(function(userR) {
        res.status(200).json({user: userR.auth()});
      });

    }else{
      res.status(400).json({
        errors:{
          global: "Token its not found"
        }
      });
    }

  }catch(e){
    console.log(e);
    res.status(500).json({
      errors:{
        global: "sorry, "+ e
      }
    });
  }
});

//reset Password (forgot)
router.route("/resetPassword").post(async(req,res,next)=>{
  try{
    var userDB = await user.where({email:req.body.email}).fetch();
    if(!!userDB){
      sendResetPasswordEmail(userDB);
      res.status(200).send({data:"Email has send"});
    }else{
      res.status(400).json({errors: { global: "There is no user with such email" }})
    }
  }catch(e){
    console.log(e);
    res.status(500).json({
      errors:{
        global: "sorry, "+ e
      }
    });
  }
});

//validate token reset Password (forgot)
router.route("/validateResetPass").post(async(req,res,next)=>{
  try{
    if(req.body.token===undefined || req.body.token==null){
      return res.status(400).json({errors:{global:"The petition not have token"}});
    }
    jwt.verify(req.body.token,process.env.JWT_SECRETKEY,(err,decode)=>{
      if(err){
        res.status(401).json({errors:{global:"Token invalid, can't get authorization "}});
      }else{
        res.status(200).json({state: "success"});
      }
    });

  }catch(e){
    res.status(500).json({
      errors:{
        global: "sorry, "+ e
      }
    });
  }
});

//reset new password form
router.route('/resetNewPassword').post(async(req,res,next)=>{
  try{
    console.log(req.body);
    var bodyValidate = validateResetPassword(req.body.data);
    
    if(!bodyValidate.isValid){
      return res.status(400).json({errors:bodyValidate.errors});
    }

    const {token,password} = req.body.data;

    jwt.verify(token,process.env.JWT_SECRETKEY,(err,decoded)=>{
      if(err){
        res.status(401).json({errors:{global:"Token invalid, can't get authorization "}});
      }else{
        var passwordHash = bcrypt.hashSync(password,8);
        user.where({id:decoded.id}).save({ password : passwordHash}, {patch: true}).then(()=>{
          res.status(200).json({success:true});
        });
      }
    });

  }catch(e){
    console.log(e);
    res.status(500).json({
      errors: { global: "sorry," + e }
    });
  }
});


//#region function helper
function validate(data){
  let errors = {};
  if(data.email==='') errors.email = "Can't be empty email";
  if(data.password==='') errors.password = "Can't be empty password";
  const isValid = Object.keys(errors).length === 0;
  return { errors,isValid };
}
function validateResetPassword(data){
  let errors = {};
  if(!data){
    errors.global = "don't have params, need params";
  } 
  else{
    if(!data.token) errors.global.token = "Can't be empty token";
    if(!data.password) errors.password = "Can't be empty password";
  }
  const isValid = Object.keys(errors).length === 0;
  return {errors,isValid}
}
//#endregion

router.route("/*").post((req,res)=>{
      res.status(404).json("404, methods not implements");
});

module.exports = router;