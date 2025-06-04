import express from "express";
import chatController from "../controllers/chat_controller";

const router = express.Router();

router.post("/get_room_list", chatController.GetRoomList);
router.post("/get_chat_record", chatController.GetChatRoomRecord);

export default router;
