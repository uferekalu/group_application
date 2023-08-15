const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  creator_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'groups',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

Group.associate = (models) => {
  Group.belongsTo(models.User, { foreignKey: 'creator_id' });
  Group.hasMany(models.Group_members, { foreignKey: 'group_id' });
  Group.hasMany(models.Discussions, { foreignKey: 'group_id' });
};

module.exports = Group;