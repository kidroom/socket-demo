import express from "express";
import chatController from "../controllers/chat_controller";

const router = express.Router();

router.post("/register", chatController.GetRoomList);
router.post("/login", chatController.Login);

export default router;
