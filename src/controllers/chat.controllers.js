import { Chat } from "../models/chat.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import User from '../models/user.models.js'
// console.log(User)
/**
 * we will get request from client 
 * from req.body we will get how many members are participating ...
 * if members.length ==2 then its sure that its not a group chat ...else in model while creating the chat we will mention true to the isGoupChat attribute
 * we will a chat on the basis of the info we have ....
 * so while creating chat it will be like 
 * so the chat name will be as same as the username 
 * isGroup already decided that if members.length>2 
 * members : come from  we will have to find _id of each user ...for this we will use the username of the members and then we will make an array in which we will put altogether 
 * latestChatMEssage will not be required ....
 * unreadMessage also not required  
 */
// const createNewChat = asyncHandler(async(req,res)=>{
//     // const {members} = req.body
//     const {chatName, members} = req.body
//     if(!chatName){
//         throw new ApiError(400,"chatName is REQUIRED")
//     }
//     if(!members || members.length===0){
//         throw new ApiError(400,"Bad request as either memebers is undefined or no member found")
//     }
//     members = [...members + req.user.username]
//     const members_id = []

//     if(members.length==2){
//         const ChatMember = await User.findOne({
//             username:members[0]
//         }).select('-password -refreshToken')
//         members_id =   [ChatMember._id ,req.user._id]
//         const newChat = await Chat.create({
//             chatName,
//             members : members_id,
//         })
//         if(!newChat){
//             throw new ApiError(401, "something went wrong while creating a new chat")
//         }
//         return res
//         .status(201)
//         .json(
//             new ApiResponse(201,newChat,"new chat created successfully")
//         )
//     }
//     members.forEach(async (member) => {
//         const ChatMember = await User.findOne({
//             username: member
//         })
//         if(!ChatMember){
//             throw new ApiError(400,"user with username "+member+ " not found")
//         }
//         members_id = [...members_id , ChatMember._id]
//     });
//     members_id = [...members_id ,req.user._id]
//     const newGroupChat = await Chat.create({
//         chatName,
//         members:members_id,
//         isGroupChat : true,
//         groupAdmin : req.user._id
//     })
//     if(!newGroupChat){
//         throw new ApiError(400,"something went wrong while creating group chat")
//     }
//     return res
//     .status(201)
//     .json(
//         new ApiResponse(201,newGroupChat,"Group Chat created successfully")
//     )



//     // if(members.length()==0){
//     //     throw new ApiError(400,"invalid request")
//     // }   
//     // const membersId = []
//     // members.forEach((member) => {
//     //     [membersId...  + member] 
//     // });   

//     // const savedChat = await chat.save()
//     // if(!savedChat){
//     //     throw new ApiError(500,"something went wrong while setting up chat")
//     // }
//     // res
//     // .status(201)
//     // .json(
//     //     new ApiResponse(201, savedChat , "chats saved successfully")
//     // )
// })
const createNewChat = asyncHandler(async (req, res) => {
    let { chatName, members } = req.body;

    if (!members || !Array.isArray(members) || members.length === 0) {
        throw new ApiError(400, "Invalid request: 'members' must be a non-empty array");
    }

    const updatedMembers = [...new Set([...members, req.user.username])]; 

    const memberDocs = [];
    for (const username of updatedMembers) {
        const user = await User.findOne({ username });
        if (!user) {
            throw new ApiError(400, `User '${username}' not found`);
        }
        memberDocs.push(user);
    }

    const members_id = memberDocs.map(user => user._id);
    const isGroup = members_id.length > 2;

    if (isGroup && (!chatName || chatName.trim() === "")) {
        throw new ApiError(400, "Group chat must have a chat name");
    }

    if (!isGroup) {
        const existingChat = await Chat.findOne({
            isGroup: false,
            members: { $all: members_id, $size: 2 }
        });

        if (existingChat) {
            return res.status(200).json(
                new ApiResponse(200, existingChat, "Chat already exists")
            );
        }
    }

    const chatData = {
        members: members_id,
        isGroup
    };

    if (isGroup) {
        chatData.chatName = chatName;
        chatData.groupAdmin = req.user._id;
    }

    const newChat = await Chat.create(chatData);

    if (!newChat) {
        throw new ApiError(500, "Failed to create chat");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, newChat, "Chat created successfully")
    );
});

const getAllChats = asyncHandler(async (req, res) => {
    const allChats = await Chat.find({ members: { $in: [req.user._id] } })
        .populate("members", "-password -refreshToken")
        .populate("groupAdmin", "-password -refreshToken")
        .populate({
            path: "latestmessage",
            populate: {
                path: "sender",
                select: "username email" 
            }
        })
        .sort({ updatedAt: -1 }); 

    if (!allChats) {
        throw new ApiError(400, "Error while fetching user chats");
    }

    return res.status(200).json(
        new ApiResponse(200, allChats, "Chats fetched successfully")
    );
});

export {createNewChat,getAllChats}