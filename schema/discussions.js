const { Sequelize } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        tableName: 'discussions',
        timestamps: false
    });

    return Discussions
};
