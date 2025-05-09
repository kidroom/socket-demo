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

// 1. 定義屬性型別
interface UserAttributes {
  id: string;
  account: string;
  password: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  status: number;
  createDate: Date;
  updateDate?: Date | null;
  deleteDate?: Date | null;
}
interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createDate"> {}

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
  declare createDate: Date;
  declare updateDate?: Date | null;
  declare deleteDate?: Date | null;

  // static associate(models: any) {
  //   // 定義關聯
  // }
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
      createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updateDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleteDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      freezeTableName: true,
      timestamps: false, // 你有自定義 createDate/updateDate，因此關掉 Sequelize 自動的 createdAt/updatedAt
    }
  );

  return User;
}
