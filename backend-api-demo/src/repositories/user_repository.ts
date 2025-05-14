import { Sequelize, Op } from "sequelize";
const db = require("../libs/database"); // 注意：CommonJS 的引用方式
import { User } from "../models/user";
import { UserStatus } from "../libs/db_enum";

class UserRepository {
  /** 查詢使用者
   * @param id
   * @returns
   */
  async QueryUserAsync(id: number): Promise<User | null> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const user = await User.findByPk(id);
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

  /** 查詢活躍使用者
   * @param account
   * @returns
   */
  async QueryExistUserByAccountAsync(account: string): Promise<User | null> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const user = await User.findOne({
        where: {
          [Op.and]: [
            {
              status: {
                [Op.ne]: UserStatus.Delete,
              },
            },
            {
              account: {
                [Op.eq]: account,
              },
            },
          ],
        },
      });
      return user;
    } catch (error) {
      console.error("無法連線到資料庫:", error);
      return null;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  /** 建立使用者
   * @param account
   * @param password
   * @param name
   * @param email
   * @param phone
   * @returns
   */
  async CreateUserAsync(
    account: string,
    password: string,
    name: string | null = null,
    email: string | null = null,
    phone: string | null = null
  ): Promise<User> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const newUser = await User.create({
        account: account,
        password: password,
        name: name,
        email: email,
        phone: phone,
        status: UserStatus.Activity,
      });
      console.log("建立使用者:", newUser.toJSON());
      return newUser;
    } catch (error) {
      console.error("無法連線到資料庫:", error);
      throw error;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  /** 更新玩家資料
   * @param user
   * @returns
   */
  async UpdateUserAsync(user: User): Promise<[number, User[]]> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const [affectedCount, updatedUsers] = await User.update(
        { name: "Johnny Doe" }, // 注意：這裡的更新資料是寫死的
        { where: { id: user.id }, returning: true }
      );
      console.log(
        "更新使用者:",
        updatedUsers.map((u) => u.toJSON())
      );
      return [affectedCount, updatedUsers];
    } catch (error) {
      console.error("無法連線到資料庫:", error);
      throw error;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  /** 刪除使用者
   * @param user
   * @returns
   */
  async DeleteUsersAsync(user: User): Promise<number> {
    try {
      await db.sequelize.authenticate();
      console.log("資料庫連線成功！");
      const deletedRowCount = await User.destroy({
        where: { id: user.id },
      });
      console.log("使用者已刪除:", deletedRowCount > 0);
      return deletedRowCount;
    } catch (error) {
      console.error("無法連線到資料庫:", error);
      throw error;
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }
}

export default new UserRepository();
