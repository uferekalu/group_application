const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
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
        timestamp: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        tableName: 'notifications',
        timestamps: false
    });

    return Notifications
};

