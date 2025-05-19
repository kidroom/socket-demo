import { Op } from "sequelize";
const db = require("../libs/database"); // 注意：CommonJS 的引用方式
import { ChatRoomRelativeUser } from "../../database/models/chat_room_relative_user";
import { UserStatus } from "../libs/db_enum";

class UserRepository {
  /** 查詢使用者
   * @param id
   * @returns
   */
  async GetRoomList(id: number): Promise<User | null> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const user = await ChatRoomRelativeUser.findByPk(id);
      console.log("查詢使用者:", user ? user.toJSON() : "使用者不存在");
      return user;
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
