import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';


const PORT = process.env.PORT || 8000;

//cloudinary configuration....
cloudinary.v2.config({
cloud_name:process.env.YOUR_CLOUDINARY_CLOUD_NAME,
api_key: process.env.YOUR_CLOUDINARY_API_KEY,
api_secret: process.env.YOUR_CLOUDINARY_API_SECRET
});

app.listen(PORT, async ()=>{
  await connectionToDB();
  console.log(`server is running at ${PORT}`);
})