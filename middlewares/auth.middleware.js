import AppError from "../utils/error.util.js";
import jwt from 'jsonwebtoken'

async function isloggedIn(req, res, next) {
  const { token } = req.cookies; // cookieparser se parse hua

  if (!token) {
    return next(new AppError('Unauthenticated,please login again', 401));
  }

  // token nhi mila to error return kro, agr mila to userdetails nikalo JWT se
  const userdetails = await jwt.verify(token, process.env.JWT_SECRET);

  req.user = userdetails;

  next();

}

const authorizedRoles = (...roles)=> async(req, res ,next)=>{
const currentUserRole = req.user.role;
if(!roles.includes.currentUserRole){
return next(
  new AppError('You dont have permission to access this course', 500)
)
}
next();
}

export{
  isloggedIn,
  authorizedRoles
}