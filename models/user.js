import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ["HOME", "OFFICE", "OTHER"], default: "HOME" },
  street: String,
  city: String,
  state: String,
  zipCode: String,
});

const walletSchema = new mongoose.Schema({
  balance: { type: Number, default: 0 },
});

const preferencesSchema = new mongoose.Schema({
  darkMode: { type: Boolean, default: false },
  notifications: { type: Boolean, default: true },
});


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique:true,
        },
        firebaseUid: { type: String , }, 
        password: {
            type: String,
        },
        role: {
            type: String, enum: ["admin", "customer"],
            default: "customer"
        },
         isVerified: { type: Boolean, default: false },
           otp: { type: String },
  otpExpires: { type: Date },
        profileImage:{
            type:String,
            default:null,
        },
       
    },
     {timestamps:true}
);
export default mongoose.model("User", userSchema);