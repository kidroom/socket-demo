import {
  Model,
  DataTypes,
  Optional,
  Sequelize,
  UUIDV4,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { User } from "../models/user";

// 1. 定義屬性型別
interface AuthTokenAttributes {
  id: number;
  user_id: string;
  token: string;
  device: string;
  expired_date: Date;
  createdAt: Date;
}
interface AuthTokenCreationAttributes
  extends Optional<AuthTokenAttributes, "id" | "createdAt"> {}

// 2. 建立 Sequelize model class
export class AuthToken
  extends Model<InferAttributes<AuthToken>, AuthTokenCreationAttributes>
  implements AuthTokenAttributes
{
  declare id: number;
  declare user_id: string;
  declare token: string;
  declare device: string;
  declare expired_date: Date;
  declare createdAt: Date;

  static associate(models: { User: typeof User }) {
    AuthToken.belongsTo(models.User, {
      foreignKey: "user_id",
    });
  }
}

// 3. 初始化 model
export function initAuthTokenModel(sequelize: Sequelize): typeof AuthToken {
  AuthToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      device: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expired_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "auth_token",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createdAt/updatedAt，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return AuthToken;
}
