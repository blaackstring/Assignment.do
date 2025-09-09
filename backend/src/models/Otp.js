import mongoose from "mongoose";

const Schema= new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    otp:{type:String,required:true},
    createdAt:{type:Date,default:Date.now,expires:300} //otp expires in 5 minutes
},{timestamps:true})

const OtpModel= mongoose.model('Otp',Schema);
export default OtpModel;