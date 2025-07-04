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
import { ChatRoomRelativeUser } from "./chat_room_relative_user";
import { ChatRoomRecord } from "./chat_room_record";

// 1. 定義屬性型別
interface ChatRoomAttributes {
  id: number;
  room_name: string;
  status: number;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
interface ChatRoomCreationAttributes
  extends Optional<ChatRoomAttributes, "id" | "createdAt"> {}

// 2. 建立 Sequelize model class
export class ChatRoom
  extends Model<InferAttributes<ChatRoom>, ChatRoomCreationAttributes>
  implements ChatRoomAttributes
{
  declare id: number;
  declare room_name: string;
  declare status: number;
  declare createdAt: Date;
  declare updatedAt?: Date | null;
  declare deletedAt?: Date | null;
}

// 3. 初始化 model
export function initChatRoomModel(sequelize: Sequelize): typeof ChatRoom {
  ChatRoom.init(
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      room_name: {
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "chat_room",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createdAt/updatedAt，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return ChatRoom;
}

export function associateChatRoomModel(models: {
  ChatRoomRelativeUser: typeof ChatRoomRelativeUser;
  ChatRoomRecord: typeof ChatRoomRecord;
}) {
  ChatRoom.hasMany(models.ChatRoomRecord, {
    foreignKey: "room_id",
    sourceKey: "id",
  });
  ChatRoom.hasMany(models.ChatRoomRelativeUser, {
    foreignKey: "room_id",
    sourceKey: "id",
  });
}
