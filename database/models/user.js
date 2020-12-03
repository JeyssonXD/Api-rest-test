const config = require('../config/config');
var bookshelf  = require('bookshelf')(config);
require('dotenv').config();

//other
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const user = bookshelf.Model.extend({
  tableName: 'user',
  constructor:function(){
    bookshelf.Model.apply(this, arguments);

    this.isValidPassword = function(passwordTest){
      var thisUser=this;
      return bcrypt.compareSync(passwordTest,thisUser.attributes.password);
    },
    this.auth=()=>{
      var thisUser = this;
      return {
        email: this.get('email'),
        emailConfirmed: this.get('emailConfirmed'),
        token: this.generateJWT()
      }
    },
    this.setConfirmationToken = function(){
      this.set('confirmationToken',this.generateJWT())
    },
    this.generateConfirmationUrl = function(){
      return `${process.env.HOST}/confirmation/${this.get('confirmationToken')}`;
    },
    this.generateResetPasswordLink = function(){
      return `${process.env.HOST}/resetpassword/${this.generateResetPasswordToken()}`;
    }
    ,
    this.generateJWT = () =>{
      return jwt.sign(
        {
        email: this.get('email'),
        confirmed: this.get('emailConfirmed')
      },
      process.env.JWT_SECRETKEY
      );
    },
    this.generateResetPasswordToken = () =>{
      return jwt.sign(
        {
          id:this.get('id')
        },
      process.env.JWT_SECRETKEY,
      { expiresIn: "1h" }
      );
    }
  }
});


export default  user;