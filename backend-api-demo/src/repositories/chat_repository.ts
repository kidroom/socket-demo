import { Op } from "sequelize";
const db = require("../libs/database"); // 注意：CommonJS 的引用方式
import { ChatRoom } from "../../database/models/chat_room";
import { ChatRoomRecord } from "../../database/models/chat_room_record";
import { ChatRoomRelativeUser } from "../../database/models/chat_room_relative_user";
import { User } from "../../database/models/user";

class UserRepository {
  /** 查詢使用者
   * @param id
   * @returns
   */
  async GetRoomListAsync(
    user_id: string
  ): Promise<ChatRoomRelativeUser[] | null> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
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
      console.error("無法連線到資料庫:", error);
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
      console.log("資料庫連線成功！");
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
      console.error("無法連線到資料庫:", error);
      return null;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }
}

export default new UserRepository();
