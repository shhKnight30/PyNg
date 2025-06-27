import { Router } from "express";
import { loginUser,registerUser,logoutUser,getCurrentUser,getOtherUsers,updateAccountDetails,updateUserProfileImage,generateNewRefreshToken } from "../../controllers/user.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser ) 
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(verifyJWT,generateNewRefreshToken)
// router.route("/change-password").post(verifyJWT,ch)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/updateDetails').patch(verifyJWT,updateAccountDetails)
router.route('/update-profileImage').patch(verifyJWT,updateUserProfileImage)
router.route('/getAllUsers').patch(verifyJWT,getOtherUsers)  
export default router