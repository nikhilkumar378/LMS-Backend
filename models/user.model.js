import {Schema, model} from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({

  username:{
    type:'String',
    required:[true, 'Name is required'],
    minLength:[5, 'Name must be atleast 5 char'],
    maxLength:[50, 'Name must be less than 50 char'],
    lowercase: true,
    trim:true
  },

  email:{
    type: 'String',
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    unique: true,
    match:[/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/]
  },

  password:{
    type: 'String',
    required:[true, 'Password is required'],
    minLength:[8, 'Password must be at least 8 char'],
    select:false
  },

  avatar:{
  public_id:{
    type:'String'
  },

  secure_url:{
    type:'String'
  }
  },
  role:{          // user and admin level pr login karana ya access dena
  type: 'String',
  enum:['USER', 'ADMIN'],
  default:'USER'  // jab tak mention na ho tab tak user level pr rakhna
  },
  forgotPasswordToken:String,
  forgotPasswordExpiry:String

},{
  timestamps:true
});

userSchema.pre('save', async function(next){     //save krne se pahle function ko dekhna  
if(!this.isModified('password')){
  return next();
}  // before saving to DB password will be encrypted by bcryptjs
this.password = await bcrypt.hash(this.password, 10);  //upr bcrypt import krlete h
});


//JWT token 

userSchema.methods = {
  generateJWToken: async function(){
    return await jwt.sign(
      {id: this._id, email: this.email, subscription: this.subscription, role: this.role},
      process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRY}
     
    )
  },

  comparePassword:async function(plainTextPassword){
   return await bcrypt.compare(plainTextPassword, this.password)
  },


  generatePasswordResetToken: async function(){
    const resetToken = crypto.randomBytes(20).toString('hex');

  this.forgotPasswordToken = crypto  // encrypted h ye 
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')
  ;

  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000; // for 15 minutes
   
 return  resetToken; // encrypted token nhi h ye
    
  }

}

  


const user = model('user', userSchema)
export default user;