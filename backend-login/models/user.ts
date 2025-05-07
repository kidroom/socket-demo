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
  name?: string;
  email?: string;
  phone?: string;
  status: Date;
  createDate: Date;
  updateDate?: Date;
  deleteDate?: Date;
}

// 2. 建立 Sequelize model class
export class User
  extends Model<InferAttributes<User>, InferCreationAttributes<User>>
  implements UserAttributes
{
  declare id: string;
  declare name?: string;
  declare email?: string;
  declare phone?: string;
  declare status: Date;
  declare createDate: Date;
  declare updateDate?: Date;
  declare deleteDate?: Date;

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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
