import { User } from "../models/user.models.js"
const generateAccessAndRefreshToken = async(userId)=>{
    
    try {
        const user = await User.findById(userId)
         const accessToken= await user.generateAccessToken()
        const refreshToken= await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        console.log(error)
    }
}

export {generateAccessAndRefreshToken}