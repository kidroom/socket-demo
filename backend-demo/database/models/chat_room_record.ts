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
interface ChatRoomRecordAttributes {
  id: number;
  room_id: string;
  user_id: string;
  sort: number;
  message: string;
  status: number;
  createdAt: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
}
interface ChatRoomRecordCreationAttributes
  extends Optional<ChatRoomRecordAttributes, "id" | "createdAt"> {}

// 2. 建立 Sequelize model class
export class ChatRoomRecord
  extends Model<
    InferAttributes<ChatRoomRecord>,
    ChatRoomRecordCreationAttributes
  >
  implements ChatRoomRecordAttributes
{
  declare id: number;
  declare room_id: string;
  declare user_id: string;
  declare sort: number;
  declare message: string;
  declare status: number;
  declare createdAt: Date;
  declare updatedAt?: Date | null;
  declare deletedAt?: Date | null;

  //關聯表
  declare chat_room?: ChatRoom;
  declare user?: User;
}

// 3. 初始化 model
export function initChatRoomRecordModel(
  sequelize: Sequelize
): typeof ChatRoomRecord {
  ChatRoomRecord.init(
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
      sort: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
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
      modelName: "chat_room_record",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createdAt/updatedAt，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return ChatRoomRecord;
}

export function associateChatRoomRecordModel(models: {
  ChatRoom: typeof ChatRoom;
  User: typeof User;
}) {
  ChatRoomRecord.belongsTo(models.ChatRoom, {
    foreignKey: "room_id",
    targetKey: "id",
  });
  ChatRoomRecord.belongsTo(models.User, {
    foreignKey: "user_id",
    targetKey: "id",
  });
}
