import { Op } from "sequelize";
import db from "../utils/database";
import { ChatRoom } from "../../database/models/chat_room";
import { ChatRoomRecord } from "../../database/models/chat_room_record";
import { ChatRoomRelativeUser } from "../../database/models/chat_room_relative_user";
import { User } from "../../database/models/user";
import logger from "../utils/logger";

class ChatRepository {
  /** 查詢使用者
   * @param id
   * @returns
   */
  async GetRoomListAsync(
    user_id: string
  ): Promise<ChatRoomRelativeUser[] | null> {
    try {
      await db.sequelize.authenticate();
      logger.info("資料庫連線成功！");
      const rooms = await ChatRoomRelativeUser.findAll({
        include: [
          {
            model: ChatRoom,
            as: "chat_room",
            attributes: ["room_name"],
          },
        ],
        where: {
          user_id: {
            [Op.eq]: user_id,
          },
        },
      });
      return rooms;
    } catch (error) {
      logger.error("無法連線到資料庫:", error);
      return null;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  /** 查詢聊天室內容
   * @param room_id
   * @returns
   */
  async GetChatContentAsync(room_id: string): Promise<ChatRoomRecord[] | null> {
    try {
      await db.sequelize.authenticate();
      logger.info("資料庫連線成功！");
      const rooms = await ChatRoomRecord.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["name"],
          },
        ],
        where: {
          room_id: {
            [Op.eq]: room_id,
          },
        },
        order: [["sort", "ASC"]],
      });
      return rooms;
    } catch (error) {
      logger.error("無法連線到資料庫:", error);
      return null;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  async SetChatMessageAsync(message: ChatRoomRecord): Promise<void> {
    try {
      logger.info('開始儲存聊天訊息...');
      logger.info('訊息內容:', JSON.stringify(message, null, 2));
      
      // 驗證必填欄位
      const requiredFields = ['room_id', 'user_id', 'sort', 'message'];
      const missingFields = requiredFields.filter(field => !message[field as keyof ChatRoomRecord]);
      
      if (missingFields.length > 0) {
        throw new Error(`缺少必要欄位: ${missingFields.join(', ')}`);
      }
      
      await db.sequelize.authenticate();
      logger.info('資料庫連線成功');
      
      const createdRecord = await ChatRoomRecord.create({
        room_id: message.room_id,
        user_id: message.user_id,
        sort: message.sort,
        message: message.message,
        status: message.status || 1,
        createdAt: message.createdAt || new Date()
      });
      
      logger.info('訊息儲存成功，ID:', createdRecord.id);
      return;
    } catch (error: unknown) {
      logger.error('儲存聊天訊息時發生錯誤:');
      if (error instanceof Error) {
        logger.error('錯誤訊息:', error.message);
        logger.error('錯誤堆疊:', error.stack);
      } else {
        logger.error('發生未知錯誤:', error);
      }
      throw error; // 重新拋出錯誤，讓上層處理
    }
  }
}

export default new ChatRepository();
