// src/libs/database.ts
import { Sequelize, Dialect } from "sequelize";
import { initUserModel, User } from "../models/user";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "TestDb",
  process.env.DB_USER || "leon",
  process.env.DB_PASS || "123456",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: (process.env.DB_DIALECT || "mysql") as Dialect, // 轉型為 Dialect 也可更安全
    port: parseInt(process.env.DB_PORT || "5432", 10),
  }
);

const db = {
  sequelize,
  User: initUserModel(sequelize),
};

export default db;
