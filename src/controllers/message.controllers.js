import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { Chat } from "../models/chat.models.js";
// import { User } from "../models/user.models.js";
import { Message } from "../models/message.models.js";
import { asyncHandler } from "../utils/AsyncHandler";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { chat, content, messageType, replyTo } = req.body;

    if (!chat) {
        throw new ApiError(400, "Invalid Chat Request");
    }

    if (!content && !req.files?.media && !messageType) {
        throw new ApiError(400, "Nothing to send in message");
    }

    let media = null;
    let filemeta = {};

    if (req.files?.media && req.files.media[0]?.path) {
        const localFilePath = req.files.media[0].path;

        media = await uploadOnCloudinary(localFilePath);
        if (!media || !media.url) {
            throw new ApiError(400, "Error while uploading on Cloudinary");
        }

        filemeta = {
            fileName: media.original_filename,
            fileSize: media.bytes,
            mimeType: `${media.resource_type}/${media.format}`,
        };
    }

    const newMessage = await Message.create({
        chat,
        sender: req.user._id,
        content,
        messageType: messageType || "text",
        mediaurl: media?.url,
        filemeta,
        replyto: replyTo || undefined,  
    });

    if (!newMessage) {
        throw new ApiError(400, "Error while sending message");
    }

    const fullMessage = await newMessage.populate([
        { path: "sender", select: "username email" },
        { path: "replyto" },
        { path: "chat" },
    ]);

    return res
        .status(201)
        .json(new ApiResponse(201, fullMessage, "Message sent successfully"));
});


const getAllMessages = asyncHandler(async (req,res) =>{
    // const allMessages = await Message.find({
    //     chat: req.params?.chat._id
    // }).sort({createdAt:1})
    const {chatid} = req.query 
    if(!chatid){
        throw new ApiError(400, "Chat id is required")
    } 
    const allMessages = await Message.find({ chat: chatId })
        .sort({ createdAt: 1 })
        .populate([
            { path: "sender", select: "username email" },
            { path: "replyto" }
        ]);
    return res
    .status(200)
    .json(
        new ApiResponse(200,allMessages,"messages fetched sucessfully")
    )
})

export {sendMessage,getAllMessages}