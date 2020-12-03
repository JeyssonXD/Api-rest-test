import nodemailer from "nodemailer";
require('dotenv').config();

const from ='"Bookworm" <infor@bookworm.com>';

const  setup = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
}

export function sendConfirmationEmail(user){
    const transport = setup();
    const email = {
        from,
        to: user.get('email'),
        subject: "Welcome to Bookworm",
        text:
        `Welcome to Bookworm. Please, confirm your email.
            ${user.generateConfirmationUrl()}
        `
    }
    console.log(email);
    transport.sendMail(email);
}

export function sendResetPasswordEmail(user){
    const transport = setup();
    const email = {
        from,
        to: user.get('email'),
        subject: "welcome to Bookworm",
        text:`
            Welcome to Bookworm. Please, confirm your email.
            ${user.generateResetPasswordLink()}
        `
    };
    console.log(email);
    transport.sendMail(email);
}