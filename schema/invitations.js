
module.exports = (sequelize, DataTypes) => {
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

    return Invitations
};
