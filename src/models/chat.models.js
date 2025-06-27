import mongoose, { Schema,model } from "mongoose";

const chatSchema = new Schema({
    chatName:{
        type:String,
        required :true,
        trim:true
    },
    isGroup:{
        type:Boolean,
        default :false,
    },
    members: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],
    groupAdmin: (isGroupChat) ? {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }: {},
    latestmessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message", 
    },
    unreadmessage:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message", 
    }]
},
    {
        timestamps:true,
    }
)

export const Chat = model("Chat",chatSchema)