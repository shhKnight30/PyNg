import { upload } from "../../middlewares/multer.middlewares";
import { verifyJWT } from "../../middlewares/auth.middlewares";
import { sendMessage,getAllMessages } from "../../controllers/message.controllers";

import { Router } from "express";

const router = Router()

router.route('/send-message').post(verifyJWT,upload.fields({
    name:"media",
    maxCount:1
}),sendMessage)
router.route('/get-all-messages').get(verifyJWT,getAllMessages)


export default router