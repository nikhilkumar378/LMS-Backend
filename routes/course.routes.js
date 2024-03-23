import { Router } from 'express';
import { addLectureToCourseByid, createCourse, getAllCourses, getLecturesBycourseId, removeCourse, updateCourse } from '../controllers/course.controller.js';
import { authorizedRoles, isloggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';


const router = Router();

router.route('/')
.get(getAllCourses)
.post(
  authorizedRoles('ADMIN'),
  upload.single('thumbnail'),
  createCourse)





router.route('/:id')
.get(isloggedIn ,getLecturesBycourseId)
.put(
  isloggedIn,
  authorizedRoles('ADMIN'),
  updateCourse)
.delete(
  authorizedRoles('ADMIN'),
  isloggedIn,
  removeCourse)

  .post(
    isloggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLectureToCourseByid
  )

export default Router;