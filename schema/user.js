const bcrypt = require('bcrypt');
const { sequelize } = require('../db_credentials');
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  username: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(value, salt);
      this.setDataValue('password', hashedPassword);
    }
  },
  profile_picture: {
    type: DataTypes.STRING(255)
  },
  country: {
    type: DataTypes.STRING(255)
  },
  sex: {
    type: DataTypes.ENUM('Male', 'Female', 'Other')
  },
  hobbies: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

User.associate = (models) => {
  User.hasMany(models.Group_members, { foreignKey: 'user_id' });
  User.hasMany(models.Discussions, { foreignKey: 'author_id' });
  User.hasMany(models.Comments, { foreignKey: 'author_id' });
  User.hasMany(models.Invitations, { as: 'SentInvitations', foreignKey: 'sender_id' });
  User.hasMany(models.Invitations, { as: 'ReceivedInvitations', foreignKey: 'receiver_id' });
  User.hasMany(models.Notifications, { as: 'SentNotifications', foreignKey: 'sender_id' });
  User.hasMany(models.Notifications, { as: 'ReceivedNotifications', foreignKey: 'receiver_id' });
};

module.exports = User;