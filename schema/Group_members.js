const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Group_members = sequelize.define('Group_members', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Group',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'group_members',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

Group_members.associate = (models) => {
  Group_members.belongsTo(models.Group, { foreignKey: 'group_id' });
  Group_members.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = Group_members;