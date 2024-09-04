import  express from 'express';
import  cors from 'cors';
import  cookieparser from 'cookie-parser';
import { config} from 'dotenv'
config();
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'
import courseRoutes from './routes/course.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
//  app.use(cors({
//   // origin:["http://localhost:5173"],
//   // methods: ['DELETE'],
 
//   credentials:true
//  }));

app.use(cors({credentials: true, origin: 'http://localhost:5173'}));



// "http://localhost:5173"//

 app.use(cookieparser());

 app.use(morgan('dev'));

 app.use('/ping', function(req,res){
  res.send('/pong')
 });

 
 app.use('/api/v1/user', userRoutes);   // yaha tak nhi exxecute hua to aap neeche jao middleware me phir kuch locha hua hoga waha
 
 
 app.use('/api/v1/courses', courseRoutes);
  


 app.all('*', (req, res)=>{
  res.status(404).send( 'OOPS! 404 page not found')
 });


 app.use(errorMiddleware); //after checking above two lines

 export default app;