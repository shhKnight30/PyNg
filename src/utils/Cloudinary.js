import { v2 as cloudinary } from "cloudinary";
import {log} from "console"
import fs from "fs"
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath){
            console.log("no file path")
            return null
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        try {
            fs.promises.unlink(localFilePath)
        } catch (error) {
            console.log("error while unlinking the file uploaded : ",error)
            return null
        }
        return response
    } catch (error) {
        console.log("error while uploading file at cloudinary : ",error)
        return null  
    } 
}


export {uploadOnCloudinary}