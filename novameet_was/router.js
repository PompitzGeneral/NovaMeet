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
  postInactiveUserInfo,
  postUpdateDailyFocusTime,
} from "./controllers/userController.js";

import {
  postLogin,
  postLogout,
  postRegister,
  postEmailAuth
} from "./controllers/authController.js";

import {
  postRequestRoomInfos,
  postCreateRoom,
  postJoinRoom,
  postDeleteRoom
} from "./controllers/roomController.js";

import {
  postRequestFocusTimeRecord
} from "./controllers/recordController.js";

const router = express.Router();

router.route("/requestUserInfo").post(postRequestUserInfo);
router.route("/updateUserInfo").post(userImageUpload.single("file"), postUpdateUserInfo);
router.route("/updateUserPassword").post(postUpdateUserPassword);
router.route("/activeUserInfo").post(postActiveUserInfo);
router.route("/inactiveUserInfo").post(postInactiveUserInfo);
router.route("/updateDailyFocusTime").post(postUpdateDailyFocusTime);

router.route("/login").post(postLogin);
router.route("/logout").post(postLogout);
router.route("/register").post(postRegister);
router.route("/emailAuth").post(postEmailAuth);

router.route("/requestRoomInfos").post(postRequestRoomInfos);
router.route("/createRoom").post(roomImageUpload.single("roomThumbnail"), postCreateRoom);
router.route("/joinRoom").post(postJoinRoom);
router.route("/deleteRoom").post(postDeleteRoom);

router.route("/requestFocusTimeRecord").post(postRequestFocusTimeRecord);

export default router;