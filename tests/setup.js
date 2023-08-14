const { Sequelize, DataTypes } = require("sequelize");
const path = require('path');
const { sequelize } = require("../db_credentials");

// Import Sequelize models
const UserModel = require(path.join(__dirname, '..', 'schema', 'user.js'));
const GroupModel = require(path.join(__dirname, '..', 'schema', 'group.js'));
const GroupMembersModel = require(path.join(__dirname, '..', 'schema', 'Group_members.js'));
const InvitationsModel = require(path.join(__dirname, '..', 'schema', 'invitations.js'));
const DiscussionsModel = require(path.join(__dirname, '..', 'schema', 'discussions.js'));
const CommentsModel = require(path.join(__dirname, '..', 'schema', 'comments.js'));
const NotificationsModel = require(path.join(__dirname, '..', 'schema', 'notifications.js'));

// Initialize Sequelize models
const User = UserModel(sequelize, DataTypes);
const Group = GroupModel(sequelize, DataTypes)
const GroupMembers = GroupMembersModel(sequelize, DataTypes)
const Invitations = InvitationsModel(sequelize, DataTypes)
const Discussions = DiscussionsModel(sequelize, DataTypes)
const Comments = CommentsModel(sequelize, DataTypes)
const Notifications = NotificationsModel(sequelize, DataTypes)

// Export the database connection and models
module.exports = {
    sequelize,
    models: {
        User,
        Group,
        GroupMembers,
        Invitations,
        Discussions,
        Comments,
        Notifications
    }
};