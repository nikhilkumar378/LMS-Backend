import { Router} from 'express';
import{ register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateUser} from '../controllers/user.controllers.js';
import { isloggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const router = Router();

router.post('/register',upload.single("avatar"),register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',  isloggedIn, getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isloggedIn, changePassword);
router.put('/update/', isloggedIn,upload.single("avatar"), updateUser)

export default router;