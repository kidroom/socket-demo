const db = require("../libs/database");

class UserRepository {
  async QueryUser(id) {
    try {
      await db.sequelize.authenticate();

      console.log("資料庫連線成功！"); // 查詢使用者

      const user = await db.User.findByPk(id);

      console.log("查詢使用者:", user ? user.toJSON() : "使用者不存在");

      return user;
    } catch (error) {
      console.error("無法連線到資料庫:", error);
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  async QueryUsers() {
    try {
      await db.sequelize.authenticate();

      console.log("資料庫連線成功！"); // 查詢使用者

      const user = await db.User.findAll(newUser.id);

      console.log("查詢使用者:", user ? user.toJSON() : "使用者不存在");
    } catch (error) {
      console.error("無法連線到資料庫:", error);
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  async CreateUser(name, email) {
    try {
      await db.sequelize.authenticate();

      console.log("資料庫連線成功！"); // 建立使用者

      const newUser = await db.User.create({
        name: name,
        email: email,

      });

      console.log("建立使用者:", newUser.toJSON());
    } catch (error) {
      console.error("無法連線到資料庫:", error);
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  async UpdateUsers(user) {
    try {
      await db.sequelize.authenticate();

      console.log("資料庫連線成功！"); // 更新使用者

      if (user) {
        await user.update({ name: "Johnny Doe" });

        console.log("更新使用者:", (await user.reload()).toJSON());
      }
    } catch (error) {
      console.error("無法連線到資料庫:", error);
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }

  async DeleteUsers(user) {
    try {
      await db.sequelize.authenticate();

      console.log("資料庫連線成功！"); // 刪除使用者

      if (user) {
        await user.destroy();

        console.log("使用者已刪除");
      }
    } catch (error) {
      console.error("無法連線到資料庫:", error);
    } finally {
      // 可選：在應用程式結束時關閉連線
      // await db.sequelize.close();
    }
  }
}

module.exports = UserRepository;
