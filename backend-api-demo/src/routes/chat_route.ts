import express from "express";
import chatController from "../controllers/chat_controller";

const router = express.Router();

router.get("/get_room_list", chatController.GetRoomListAsync);
router.post("/get_chat_record", chatController.GetChatRoomRecordAsync);

export default router;
