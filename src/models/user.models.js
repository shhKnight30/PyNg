import { Aggregate, Schema,model, } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const userSchema = new Schema({
    username:{
        required :true,
        // lowercase : true,
        unique:true,
        type:String,
        trim:true,
        index:true
    },
    email:{
        required :true,
        unique:true,
        lowercase : true,
        type:String,
        trim:true,
        index:true
    },
    fullname:{
        required :true,
        // unique:true,
        // lowercase : true,
        type:String,
        // trim:true,
        // index:true
    },
    mobilenumber: {
        type:String,
        // required: true,
        unique:true,
        trim:true,
    },
    password: {
        type:String,
        required:[true,'Password is required'],
        minlength: 6
        // unique:true,
        // trim:true,
    },
    profileImage:{
        type:String,
        required :true,
        default : "https://res.cloudinary.com/dfjazzgd2/image/upload/v1750939333/defaultProfilePicture_cqz5rc.avif"
    },
    dateofbirth:{
        type:Date,
        required:true
    },
    refreshToken:{
        type:String
    },
    profilebio:{
        type:String
    }
},{
    timestamps:true
})

userSchema.plugin(aggregatePaginate)

userSchema.pre('save',async function(next){
    if(!this.isModified("password"))return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect =  async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id:this._id,
        email : this.email,
        // mobilenumber : this
        username : this.username,
        fullname: this.fullname
    },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN
    })
}
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id
    },
        process.env.REFRESH_TOKEN_SECRET
    ,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    })
}

export const User = model("User",userSchema)