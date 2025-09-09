import express from 'express';
import OtpModel from '../models/Otp.js';
import User from '../models/User.js';
import { SendverifyMail } from './Verification.js';

const routeVerify = express.Router();


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // it will generate 6 digit random number 
}

routeVerify.post('/sendOtp', async(req, res) => {
  try {
      const {userId}=req.body;
  console.log(userId);
  
      const user= await User.findById(userId);
      console.log(user);
      
      if(!user){
          return res.status(404).json({status:false,message:"User not found"});
      }
      
      if(user.isVerified){
        console.log("User already verified");
        
          return res.status(400).json({status:true,message:"User already verified"});
      }
  
      const otp=generateOTP();
  
      const sendOtptoDB=new  OtpModel({
          userId,otp
      })
      await sendOtptoDB.save();
  
      SendverifyMail(user.email,otp);
  
      return res.status(200).json({status:true,message:"OTP sent to your email"}); // remove otp in production
  
  
      
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:"Internal server error while sending otp"});
  }
});


routeVerify.post('/otp', async(req, res) => {
    const {userId,otp}=req.body;
    try {
        const user= await User.findById(userId);

        console.log(user);
        

        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        if(user.isVerified){
            return res.status(400).json({message:"User already verified"});
        }

        const validOtp= await OtpModel.findOne({userId,otp});
        if(!validOtp){
            return res.status(400).json({message:"Invalid OTP"});
        }
        user.isVerified=true;
        await user.save();
        await OtpModel.deleteMany({userId}); // delete all otp of user after successful verification
        return res.status(200).json({message:"User verified successfully"});
    
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Internal server error while verifying otp"});
    }
})

routeVerify.get('/isVerified/:userId',async(req,res)=>{
    try {
        const {userId}=req.params;
        const user= await User.findById(userId);
           if(user.isVerified){
            return res.status(200).json({message:"User already verified"});
        }
        return res.status(200).json({message:"User not verified"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error while checking verification status"});
    }
})
export default routeVerify;