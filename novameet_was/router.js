import express from "express";

import {
  postLogin,
  postRegister,
  postEmailAuth,
} from "./controllers/authController.js";

import {
  postRequestRoomInfos,
  postCreateRoom,
  postJoinRoom
} from "./controllers/roomController.js";

const router = express.Router();

router.route("/login").post(postLogin);
router.route("/register").post(postRegister);
router.route("/emailAuth").post(postEmailAuth);

router.route("/requestRoomInfos").post(postRequestRoomInfos);
router.route("/createRoom").post(postCreateRoom);
router.route("/joinRoom").post(postJoinRoom);

export default router;