import express from "express";
import {
  postLogin,
  postRegister,
  postEmailAuth
} from "./controller.js";

const router = express.Router();

router.route("/login").post(postLogin);
router.route("/register").post(postRegister);
router.route("/emailAuth").post(postEmailAuth);

export default router;