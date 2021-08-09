import express from "express";
import {
  userImageUpload, 
  roomImageUpload
} from "./middlewares.js";

import {
  postRequestUserInfo,
  postUpdateUserInfo,
  postUpdateUserPassword,
  postActiveUserInfo,
  postInactiveUserInfo
} from "./controllers/userController.js";

import {
  postLogin,
  postLogout,
  postRegister,
  postEmailAuth,
} from "./controllers/authController.js";

import {
  postRequestRoomInfos,
  postCreateRoom,
  postJoinRoom
} from "./controllers/roomController.js";

const router = express.Router();

router.route("/requestUserInfo").post(postRequestUserInfo);
router.route("/updateUserInfo").post(userImageUpload.single("file"), postUpdateUserInfo);
router.route("/updateUserPassword").post(postUpdateUserPassword);
router.route("/activeUserInfo").post(postActiveUserInfo);
router.route("/inactiveUserInfo").post(postInactiveUserInfo);

router.route("/login").post(postLogin);
router.route("/logout").post(postLogout);
router.route("/register").post(postRegister);
router.route("/emailAuth").post(postEmailAuth);

router.route("/requestRoomInfos").post(postRequestRoomInfos);
router.route("/createRoom").post(roomImageUpload.single("file"), postCreateRoom);
router.route("/joinRoom").post(postJoinRoom);

export default router;