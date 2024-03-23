import {model, Schema} from 'mongoose';
const courseSchema = new Schema({
  title:{
    type: String,
    required:[true, 'Title is required'],
    minlength:[8, 'Title should be at least 8 char'],
    maxlength:[59, 'Title should be less than 60 char'],
    trim:true
  },

  description:{
    type:String,
    required:[true, 'Description is required'],
    minlength:[8, 'Description must be at least 8 char'],
    maxlength:[200, 'Description should be less than 200 char'],
    trim:true
  },

  category:{
    type:String,
    required:[true, 'Category is required'],

  },

  thumbnails:{
    public_id:{
      type: String,
      required:true
      },
  
      secure_url:{
        type:String,
        required:true
      }
    
  },

  lectures:[{
   title:String,
   description:String,
   lecture:{
    public_id:{
    type: String,
    required:true
    },

    secure_url:{
      type:String,
      required:true
    }
   }

  }],

  numberoflectures:{
    type:String,
    default: 0
  },
  createdBy:{
    type:String,
    required:true
  }

},{
  timestamps: true
})

const Course = model('Course', courseSchema);
export default Course;