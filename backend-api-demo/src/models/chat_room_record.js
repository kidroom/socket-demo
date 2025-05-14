'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chat_room_record extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  chat_room_record.init({
    room_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
    sort: DataTypes.INTEGER,
    message: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'chat_room_record',
  });
  return chat_room_record;
};