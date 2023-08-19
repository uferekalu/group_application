const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Notifications = sequelize.define('Notifications', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sender_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.TEXT
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notifications',
    timestamps: false
  });
  
  Notifications.associate = (models) => {
    Notifications.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender_id' });
    Notifications.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiver_id' });
    Notifications.belongsTo(models.Group, { foreignKey: 'group_id' });
    Notifications.belongsTo(models.Discussions, { foreignKey: 'discussion_id' });
  };
  
  module.exports = Notifications;