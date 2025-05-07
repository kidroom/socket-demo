// src/libs/database.ts
import { Sequelize } from "sequelize";
import { initUserModel, User } from "../models/user";

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT as any, // 轉型為 Dialect 也可更安全
});

const db = {
  Sequelize,
  sequelize,
  User: initUserModel(sequelize),
};

export default db;
