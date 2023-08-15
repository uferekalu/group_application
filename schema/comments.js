const { DataTypes } = require("sequelize");
const { sequelize } = require("../db_credentials");

const Comments = sequelize.define('Comments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  discussion_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Discussions',
      key: 'id'
    }
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  dislikes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'comments',
  timestamps: false
});

Comments.associate = (models) => {
  Comments.belongsTo(models.User, { foreignKey: 'author_id' });
  Comments.belongsTo(models.Discussions, { foreignKey: 'discussion_id' });
};

module.exports = Comments;