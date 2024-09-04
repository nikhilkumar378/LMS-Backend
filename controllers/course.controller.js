import Course from "../models/course.model.js"
import AppError from "../utils/error.util.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary'
import asyncHandler from "../middlewares/asyncHandler.middleware.js";


const getAllCourses = asyncHandler(async(req, res, next)=>{

  try{
    const courses = await Course.find({}).select('-lectures');
    console.log(courses)
    res.status(200).json({
      success:true,
      message: 'All courses',
      courses
});

  }catch(e){
   return next(new AppError(e.message, 500));
  }
})



const getLecturesBycourseId = async ()=>{
try{
const { id } = req.params;
const course = await Course.findById(id);
res.status(200).json({
  success: true,
  message:'Course lectures fetched successfully',
  lectures: course.lectures,
})
}catch(e){
 return next(new AppError(e.message, 500));
}
}


const createCourse = async (req, res, next)=>{
const {title, description, category, createdBy} = req.body

if(!title || !description || !category || !createdBy){
  return next(new AppError('All fields are required', 400));
}

const course = await Course.create({
  title,
  description,
  category,
  createdBy,
  thumbnail:{
    public_id: 'Dummy',
    secure_url:'Dummy',
  }
});

if(!course){
  return next(new AppError('Course could not create', 400))
}

if(req.file){

  try{
    const result = await cloudinary.v2.uploader.upload(req.file.path,{  //local folder se update ho cloudinary pe
      folder: 'lms'
    });
  
    if(result){  //agr upload ho jata h to 
      course.thumbnails.public_id = result.public_id;
      course.thumbnails.secure_url = result.secure_url;
    }
  
    fs.rm(`uploads/${req.file.filename}`);

  }catch(e){
    return next(new AppError('e.message', 500));
  }
}

await course.save();
res.status(200).json({
  success:true,
  message:'Course created successfully',
  course,
});
}


const updateCourse = async (req, res, next)=>{
try{
  const {id} = req.params
  const course = await Course.findByIdAndUpdate(

    id,
    {
      $set:req.body  //jitna data h usi ko  update kr dega
    },

    {
      runValidators: true
    }
  );

  if(!course){
    return next(new AppError('Course with given id does not exist', 500));
  }

  res.status(200).json({
    success:true,
    message: 'Course updated successfully',
    course  // updated course ki information return kr rhe ho
  })

}catch(e){

return next(new AppError(e.message, 500));
}
}




const removeCourse = async ()=>{
const { id } = req.params;

const course = await Course.findById(id);
if(!course){
  return next(new AppError('Course with given id does not exist', 500));
}

await Course.findByIdAndDelete(id);

res.status(200).json({
  success: true,
  message:'Course removed successfully',
  
});

}


const addLectureToCourseByid = async ()=>{
try{
  const {title, description} = req.body;
  
if(!title || !description){
  return next(new AppError('All fields are required', 400));
}
  const {id} = req.params;

  const course = await Course.findById(id);

  if(!course){
    return next(new AppError('Course with given id does not exist', 500));
  }

  const lectureData = {
    title,
    description,
    lecture:{}
  }

  if(req.file){
    try{
      const result = await cloudinary.v2.uploader.upload(req.file.path,{  //local folder se update ho cloudinary pe
        folder: 'lms'
      });
    
      if(result){  //agr upload ho jata h to 
        lectureData.lecture.public_id = result.public_id;
        lectureData.lecture.secure_url = result.secure_url;
      }
    
      fs.rm(`uploads/${req.file.filename}`);
  
    }catch(e){
      return next(new AppError(e.message, 500));
    } 
  }

  course.lectures.push(lectureData);
  course.numberoflectures = course.lectures.length;
  await course.save();

  res.status(200).json({
    success:true,
    message:'Lecture successfully added to the course',
    course
  })
}catch(e){
  return next(new AppError(e.message, 500));
}

}


export{
  getAllCourses,
  getLecturesBycourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureToCourseByid
  
}