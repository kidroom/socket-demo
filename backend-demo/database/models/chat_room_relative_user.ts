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
import { User } from "./user";
import { ChatRoom } from "./chat_room";

// 1. 定義屬性型別
interface ChatRoomRelativeUserAttributes {
  id: number;
  room_id: string;
  user_id: string;
  status: number;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
interface ChatRoomRelativeUserCreationAttributes
  extends Optional<ChatRoomRelativeUserAttributes, "id" | "createdAt"> {}

// 2. 建立 Sequelize model class
export class ChatRoomRelativeUser
  extends Model<
    InferAttributes<ChatRoomRelativeUser, { omit: "chat_room" | "user" }>,
    ChatRoomRelativeUserCreationAttributes
  >
  implements ChatRoomRelativeUserAttributes
{
  declare id: number;
  declare room_id: string;
  declare user_id: string;
  declare status: number;
  declare createdAt: Date;
  declare updatedAt?: Date | null;
  declare deletedAt?: Date | null;

  //關聯表
  declare chat_room?: ChatRoom;
  declare user?: User;
}

// 3. 初始化 model
export function initChatRoomRelativeUserModel(
  sequelize: Sequelize
): typeof ChatRoomRelativeUser {
  ChatRoomRelativeUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
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
    },
    {
      sequelize,
      modelName: "chat_room_relative_user",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createdAt/updatedAt，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return ChatRoomRelativeUser;
}

export function associateChatRoomRelativeUserModel(models: {
  ChatRoom: typeof ChatRoom;
  User: typeof User;
}) {
  ChatRoomRelativeUser.belongsTo(models.ChatRoom, {
    foreignKey: "room_id",
    targetKey: "id",
  });
  ChatRoomRelativeUser.belongsTo(models.User, {
    foreignKey: "user_id",
    targetKey: "id",
  });
}
