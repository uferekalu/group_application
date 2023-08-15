const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Discussions = sequelize.define('Discussions', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    author_id: {
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
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'discussions',
    timestamps: false
  });
  
  Discussions.associate = (models) => {
    Discussions.belongsTo(models.User, { foreignKey: 'author_id' });
    Discussions.belongsTo(models.Group, { foreignKey: 'group_id' });
    Discussions.hasMany(models.Comments, { foreignKey: 'discussion_id' });
  };
  
  module.exports = Discussions;