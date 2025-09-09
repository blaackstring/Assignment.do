import User from '../models/User.js';

import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "siddiquishahan217@gmail.com",
      pass: "hsde vcdc xxfg ovhe",
    },
  });
  const otp = "123456";


  export const SendMail= async(userid,HabitName)=>{
console.log(userid,HabitName);

   const user= await User.findById(userid)
console.log(user);

   if(user){
 const useremail=user.email

 const htmlTemplate =  `
 <!DOCTYPE html>
 <html>
 <head>
   <meta charset="UTF-8" />
   <title>Habit Reminder</title>
 </head>
 <body style="font-family: Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 0;">
   <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
     <tr>
       <td style="padding: 30px; text-align: center;">
         <h2 style="color: #2563eb; margin-bottom: 20px;">Reminder for Task</h2>
         
         <div style="font-size: 18px; font-weight: normal; margin: 20px 0; color: #333;">
           Your task <strong style="color:#2563eb;">${HabitName}</strong> is not done yet.<br>
           Kindly complete it today ✅
         </div>
 
         <p style="font-size: 14px; color: #666;">If you didn’t set this habit, you can ignore this email.</p>
       </td>
     </tr>
   </table>
 </body>
 </html>
 `;
 


console.log(useremail);


        await transporter.sendMail({
        from:'ShahanReal01@gmail.com',
        to:useremail,
        subject:'TASK IS INCOMEPELETE YET 😴😴😴😴😴😴😴-> HABIT TRACKER',
        html:htmlTemplate
     })
     
    }
  }





   export const SendverifyMail=async(useremail,otp)=>{
    console.log(useremail,otp);
    
  
   try{

  const mail = await transporter.sendMail({
      from:'Habit Tracker Inc.',
      to:useremail,
      subject:'Verify your email - Habit Tracker',
      html:`<h1>Your verification OTP for Habit Tracker is ${otp}</h1>`
    })
    return {message:"Verification email sent", mailId:mail?.messageId}
    } catch (error) {
      console.log(error);
      return  {message:"Verification email not sent"}
    }

  }