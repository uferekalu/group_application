const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Invitations = sequelize.define('Invitations', {
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
  group_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Group',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('accepted', 'declined', 'pending'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'invitations',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

Invitations.associate = (models) => {
  Invitations.belongsTo(models.User, { as: 'Sender', foreignKey: 'sender_id' });
  Invitations.belongsTo(models.User, { as: 'Receiver', foreignKey: 'receiver_id' });
  Invitations.belongsTo(models.Group, { foreignKey: 'group_id' });
};

module.exports = Invitations;