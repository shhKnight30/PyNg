import mongoose, { Schema,model } from "mongoose";


const messageSchema = new Schema({
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chat',
        required: true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    content:{
        type:String,
        default:"",
        trim:true,
    },
    messagetype:{
        type:String,
        enum:["text","image","video","audio","document","file"],
        default:"text"
    },
    mediaurl :{
        type:String
    },
    filemeta:{
        fileName:String,
        fileSize:Number,
        mimeType : String
    },
    replyto:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    seenby: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deliveredto: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    deletedby:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    isdeletedbyall:{
        type:Boolean,
        default :false
    }
},{
    timestamps:true
})

export const Message = model("Message", messageSchema)  