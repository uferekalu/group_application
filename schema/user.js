const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
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
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(value, salt)
        this.setDataValue('password', hashedPassword)
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

  return User;
};