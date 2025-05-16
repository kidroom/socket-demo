// src/libs/database.ts
import { Sequelize, Dialect } from "sequelize";
import {
  initAuthTokenModel,
  AuthToken,
} from "../../database/models/auth_token";
import { initChatRoomModel, ChatRoom } from "../../database/models/chat_room";
import {
  initChatRoomRecordModel,
  ChatRoomRecord,
} from "../../database/models/chat_room_record";
import { initUserModel, User } from "../../database/models/user";
import dotenv from "dotenv";

dotenv.config({ path: "./backend-login/.env" });

const sequelize = new Sequelize(
  process.env.DB_NAME || "TestDb",
  process.env.DB_USER || "leon",
  process.env.DB_PASS || "123456",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: (process.env.DB_DIALECT || "postgres") as Dialect, // 轉型為 Dialect 也可更安全
    port: parseInt(process.env.DB_PORT || "5432", 10),
  }
);

const db = {
  sequelize,
  AuthToken: initAuthTokenModel(sequelize),
  ChatRoom: initChatRoomModel(sequelize),
  ChatRoomRecord: initChatRoomRecordModel(sequelize),
  User: initUserModel(sequelize),
};

module.exports = db;
