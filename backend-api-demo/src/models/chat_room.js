'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chat_room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  chat_room.init({
    user_id: DataTypes.UUID,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'chat_room',
  });
  return chat_room;
};