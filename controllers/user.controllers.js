
import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';
import sendEmail from "../utils/sendEmail.js";
import crypto from 'crypto';
import asyncHandler from "../middlewares/asyncHandler.middleware.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,  //set cookie for 7 days
  // httpOnly:true,
  // secure: true
}
const register =  asyncHandler(async (req, res, next)=>{
const {fullname, email, password } = req.body;
console.log(req.body)

if(!fullname || !email || !password){
return next(new AppError('All fields are required', 400));  //next ke through app.js me jake middleware execute krega
}

const userExists = await User.findOne({email});
if(userExists){
  return next(new AppError('Email already exists', 409));
}

const newUser = await User.create({
  fullname,
  email,
  password,
  avatar:{
    public_id: email,
    secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg'
  }

})

// console.log(User)
if(!newUser){
  return next(new AppError('User registration failed, try again later', 400)); 
}



// TO DO: File upload
// console.log('file details>',JSON.stringify(req.file));
if(req.file){
 
try{
const result = await cloudinary.v2.uploader.upload(req.file.path,{  //kisi v ek jgh se dusre jgh file upload krne me help krta h
  folder:'lms',
  width:'50',
  height:'250',
  gravity:'faces',
  crop:'fill'
  
});

console.log(result)

if(result){
  newUser.avatar.public_id =  result.public_id;
  newUser.avatar.secure_url = result.secure_url;

  //Remove file from server

  fs.rm(`uploads/${req.file.filename}`)
}
}catch(e){
return next(new AppError(Error || 'file not uploaded, please try again later', 500));
}
}





await newUser.save();

const token = await newUser.generateJWTToken();
console.log(" ab")
console.log(token)
newUser.password = undefined; //password nhi send krna h user ka info me

// AB register krne k bad user ko login karaao
// console.log(user.generateJWTToken)


//ab encrypted password ko cookie me save kr dete h

res.cookie('token', token, cookieOptions) //taki dobara login manually na krna pade

res.status(200).json({
  success: true,
  message:'User registered successfully',
  newUser, // send kr diye user ka info
});


})



const login = asyncHandler( async (req,res, next)=>{

  try{

    const{ email , password } = req.body;
    if(!email || !password){
    return next(new AppError('All fields are required', 400));
    }
  
    const newUser = await User.findOne({
      email
    }).select('+password'); // agr user milta h to password v de dena
  
    if(!(newUser && ( await newUser.comparePassword(password)))){
    return next(new AppError('Email or password does not match', 400));
    }
  
    const token = await newUser.generateJWTToken();
    newUser.password = undefined;
  
    res.cookie('token', token, cookieOptions);
  
    res.status(200).json({
      success: true,
      message:'user logged In successfully',
      newUser,
    })
  }catch(e){
    return next(new AppError(e.message, 500));
  }

})




const logout = asyncHandler(async (req, res)=>{  //logout krne k liye cookie hi delete kr do
  res.cookie('token', null,{
  secure: true,
  maxAge:0,
  httponly:true
  });

  res.status(200).json({
    
    success: true,
    message:'User logged out successfully'

  })
})

const getProfile = async (req, res)=>{

  try{
    const userId = req.user.id;
    const user = await user.findOne(userId);

    res.status(200).json({
      success:true,
      message:'user details',
      user
    });
  }catch(e){
  return next(new AppError('Failed to fetch user details', 500));
  }
 
}



const forgotPassword = async (req, res, next)=>{
const { email } = req.body;

if(!email){
  return next(new AppError('Email is required', 400));
}

const user = await user.findOne({email});

if(!user){
  return next(new AppError('Email not registered', 400));
}

const resetToken = await user.generatePasswordResetToken();

await user.save(); //databse me save kiye token ko

const resetPasswordURL = `${process.env.FRONTED_URL}/reset-password/${resetToken}`;
console.log(resetPasswordURL);

const subject = 'Reset Password'
const message = `you can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n if you have not requested this, kindly ignore`

try{
  await sendEmail(email, subject, message);

  res.status(200).json({
    success:true,
    message:`Reset password token has been sent to ${email} successfully`
  })
}catch(e){
// agr email send na ho paya ek bar me  to taki user ko ye na bole ki ham toekn ek bar bana chuke hai ab email n send krenge, 15 minutes me expire kr jayega esliye client ye na bole ki expire ho gya we do this 
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save();

  return next(new AppError(e.message, 500));
}
}



const resetPassword =async  (req, res, next)=>{
const { resetToken} = req.params; //yaha pr token mil jayega

const { password } = req.body; // phir body me password mil jayega

const forgotPasswordToken = crypto

.createHash('sha256')
.update(resetToken)
.digest('hex')

const user = await user.findOne({
  forgotPasswordToken,
  forgotPasswordExpiry: {$gt: Date.now()}
});

if(!user){
  return next(new AppError('Token is invalid or expire, try again later', 400))
}

user.password = password; // user mil gya to password save kr lenge
user.forgotPasswordExpiry = undefined;
user.forgotPasswordToken = undefined;

user.save();

res.status(200).json({
  success: true,
  message: 'password changed successfully'
})
};



const changePassword = async ()=>{
  const { oldPassword, newPassword} = req.body;
  const { id } = re.user;

  if(!oldPassword || !newPassword){
    return next(new AppError('All fields are mandatory ', 400))
  }
 const user = await user.findById(id).select('+password');

 if(!user){
  return next(new AppError('User does not exist', 400))
 }

 const isPasswordValid = await user.comparePassword(oldPassword);
 if(!isPasswordValid){
  return next(new AppError('Invalid old Password', 400));
 }

 user.password = newPassword;

 await user.save();

 user.password = undefined;

 res.status(200).json({
  success:true,
  message: 'password changed successfully!'
 });
 
};


const updateUser = async ()=>{
const { fullname } = req.body;
const {id} = re.user.id;

const user = await user.findById(id);

if(!user){
  return next(new AppError('user does not exist', 400));
}

if(req.fullname){
  user.fullname =  fullname;
}

if(req.file){ //multer k help se
await cloudinary.v2.uploader.destroy(user.avatar.public_id);  //delete already existing file so tht new pic will add
try{
  const result = await cloudinary.v2.uploader.upload(req.file.path,{  //kisi v ek jgh se dusre jgh file upload krne me help krta h
    folder:'lms',
    width:'250',
    height:'250',
    gravity:'faces',
    crop:'fill'
    
  });
  
  if(result){
    user.avatar.public_id =  result.public_id;
    user.avatar.secure_url = result.secure_url;
  
    //Remove file from server
  
    fs.rm(`uploads/${req.file.filename}`)
  }
  }catch(e){
  return next(new AppError(Error || 'file not uploaded, please try again later', 500));
  }
  
}

await user.save();

res.status(200).json({
  success: true,
  message: 'user details updated successfully'
});
}



export{
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser
}