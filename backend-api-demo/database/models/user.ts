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
import { AuthToken } from "./auth_token";
import { ChatRoomRecord } from "./chat_room_record";
import { ChatRoomRelativeUser } from "./chat_room_relative_user";

// 1. 定義屬性型別
interface UserAttributes {
  id: string;
  account: string;
  password: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: number;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt"> {}

// 2. 建立 Sequelize model class
export class User
  extends Model<InferAttributes<User>, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare account: string;
  declare password: string;
  declare name?: string | null;
  declare email?: string | null;
  declare phone?: string | null;
  declare status: number;
  declare createdAt: Date;
  declare updatedAt?: Date | null;
  declare deletedAt?: Date | null;
}

// 3. 初始化 model
export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      account: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "user",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createdAt/updatedAt，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return User;
}

export function associateUserModel(models: {
  AuthToken: typeof AuthToken;
  ChatRoomRecord: typeof ChatRoomRecord;
  ChatRoomRelativeUser: typeof ChatRoomRelativeUser;
}) {
  User.hasMany(models.AuthToken, {
    foreignKey: "user_id",
    sourceKey: "id",
  });
  User.hasMany(models.ChatRoomRecord, {
    foreignKey: "user_id",
    sourceKey: "id",
  });
  User.hasMany(models.ChatRoomRelativeUser, {
    foreignKey: "user_id",
    sourceKey: "id",
  });
}
