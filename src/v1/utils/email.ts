import nodemailer from 'nodemailer';
import { MailOptions } from "nodemailer/lib/json-transport";
import dotenv from 'dotenv';
import { ISendMail, ISendMailResp } from './common.type';

dotenv.config();

export const sendMail = function(ctx: ISendMail){
    return new Promise<ISendMailResp>( async resolve => {
        
      let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.MAILER_USERNAME?.toString(),
            pass: process.env.MAILER_PASSWORD?.toString()
          }
      });

			console.log('>> ', transporter)
          
      let mailOptions: MailOptions = {
        from: process.env.MAILER_USERNAME,
        to: ctx.email_to,
        subject: ctx.subject, // 'User my auth platform reset password',
        text: ctx.text //'For my auth platform your url to reset password is http://localhost:8000.'
      };

			console.log('>> ', mailOptions)
          
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          resolve({error: true, message: `Email: ${error.toString()}`});
        } else {
          resolve({success: true, message: `Email sent: ${info.response}`});
        }
      });
			// test
			// resolve({success: true, message: `Email sent:`});
    });
}

