import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"
// import ro
import { generateAccessAndRefreshToken } from "../utils/GenerateAccessAndRefreshToken.js"



const registerUser = asyncHandler(async(req,res)=>{
    console.log(req.body)
    const {username,email,fullname,password,dateofbirth} = req.body
    if([username,email,fullname,password].some((field)=>field.trim()==="") || !dateofbirth){
        throw new ApiError(400,"All fields are Required")
    } 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
        throw new ApiError(400,"Invalid email format")
    }
    const existingEmailUser = await User.findOne({email})
    
    if(existingEmailUser){
        throw  new ApiError(409,"email already Exists")
    }
    const existingUsernameUser = await User.findOne({username})
    
    if(existingUsernameUser){
        throw  new ApiError(409,"username already Exists")
    } 
    const user = await User.create({
        fullname,
        username,
        email,
        password,
        dateofbirth
    })
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the User")
    }
    const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    const options = {
        httpOnly:true,
        secure:true
      }
    return res
    .status(201)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(201,
            {
                user:createdUser,
                accessToken,
                refreshToken
            },
            "User created successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
      const {usernameOrEmail,password} = req.body
      if(!usernameOrEmail){
        throw new ApiError(400,"Either enter username or email : Field Required ")
      }  
      if(!password){
        throw new ApiError(400,"Password Field is required")
      }
      const user = await User.findOne(
        {$or : [{email:usernameOrEmail},{username:usernameOrEmail}]}
      )
      if(!user){
        throw new ApiError(404,"User not found !")
      }
      let loginMethod = ""
      if(user.email===usernameOrEmail){
        loginMethod=usernameOrEmail
      }else{
        loginMethod= usernameOrEmail
      }
      const isPasswordValid =  await user.isPasswordCorrect(password)
      if(!isPasswordValid){
        throw new ApiError(400,"Incorrect Password : Enter Valid Password ")
      }
      const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")    
      const options = {
        httpOnly:true,
        secure:true
      }
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(new ApiResponse(200,
        {
            user:loggedInUser,
            accessToken,
            refreshToken,

        },
        "User logged in via "+loginMethod+" successfully"
      ))
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1,
        }
    },{
        new:true
    })
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},
            "user logged out successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            req.user,
            "User Fetched Successfully"
        )
    )
})


const updateAccountDetails = asyncHandler(async ( req,res)=>{
    const {fullname,mobilenumber} = req.body
    if (!fullname || !mobilenumber) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                fullname,
                mobilenumber
            }
        },{
            new : true
        }
    ).select("-password -refreshToken")
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "User Profile Updatedn Successfully"
        )
    )
})
const updateUserProfileImage = asyncHandler(async ( req,res)=>{
    const avatarLocalPath = req.files?.avatar[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    const profileImage = await uploadOnCloudinary(avatarLocalPath)
    if (!profileImage || !profileImage.url) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
               profileImage:profileImage.url
            }
        },{
            new : true
        }

    ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200,
            user,
            "User Profile Image Updated Successfully"
        )
    )
})

const getOtherUsers = asyncHandler(async(req,res)=>{
    const userId = req.user._id
    const allUsers = await User.find({_id:{$ne:{userId}}}).select("-password -refreshToken")
    res
    .status(200)
    .json(new ApiResponse(200,allUsers,"All users fetched successfully"))
})

const generateNewRefreshToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(400,"Unauthorized Request")
    }
    try{
        const decodedRefreshToken = await jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedRefreshToken._id).select("-password")
        if(!user){
            throw new ApiError(400,"Invalid Refresh Token")
        }
        if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(401,"Refresh Token expired")
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken} = generateAccessAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(200,
                {   
                    user,
                    accessToken,
                    newRefreshToken
                },
                "new refresh token generated successfully"
            )
        )
    }catch (error) {
        throw new ApiError(400,"Invalid Refresh Token")
    }
})
export {registerUser,loginUser,logoutUser,updateAccountDetails,updateUserProfileImage,getCurrentUser,getOtherUsers,generateNewRefreshToken}