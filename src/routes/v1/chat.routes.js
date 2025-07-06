import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { createNewChat, getAllChats } from "../../controllers/chat.controllers.js";

const router = Router()
router.route('/create-new-chat').post(verifyJWT,createNewChat)
router.route('/get-all-chats').get(verifyJWT,getAllChats)

export default router