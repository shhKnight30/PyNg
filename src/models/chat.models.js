import mongoose, { Schema,model } from "mongoose";

const chatSchema = new Schema({
    isGroup:{
        type:Boolean,
        default :false,
    },
    chatName:{
        type:String,
        trim:true,
        required: function () {
            return this.isGroup === true;
        }
    },
    members: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    ],
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
            return this.isGroup === true;
        }
    },
 
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