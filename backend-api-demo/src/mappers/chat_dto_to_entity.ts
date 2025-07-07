import { ChatRoomRecord } from "../../database/models/chat_room_record";
import { MessagePayload } from "../models/chat_request";
import logger from "../utils/logger";

export function CreateChatRoomRecord(message: MessagePayload): ChatRoomRecord {
  logger.info('原始訊息內容:', JSON.stringify(message, null, 2));
  
  const value = message.value;
  if (!value) {
    throw new Error('訊息內容不能為空');
  } 

  // 檢查必要欄位
  if (!value.roomId) throw new Error('缺少必要欄位: roomId');
  if (!value.senderId) throw new Error('缺少必要欄位: senderId');
  if (value.sort === undefined || value.sort === null) throw new Error('缺少必要欄位: sort');
  if (!value.content) throw new Error('缺少必要欄位: content');

  const chatRoomRecord = new ChatRoomRecord();
  chatRoomRecord.room_id = value.roomId;
  chatRoomRecord.user_id = value.senderId;
  chatRoomRecord.sort = value.sort;
  chatRoomRecord.status = 1;
  chatRoomRecord.message = value.content;
  chatRoomRecord.createdAt = new Date(value.timestamp || Date.now());

  logger.info('轉換後的聊天記錄:', JSON.stringify(chatRoomRecord, null, 2));
  return chatRoomRecord;
}