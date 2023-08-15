const Group_members = require("./schema/Group_members");
const Comments = require("./schema/comments");
const Discussions = require("./schema/discussions");
const Group = require("./schema/group");
const Invitations = require("./schema/invitations");
const Notifications = require("./schema/notifications");
const User = require("./schema/user");

// Define associations
const defineAssociations = () => {
  User.hasMany(Group_members, { foreignKey: 'user_id' });
  User.hasMany(Discussions, { foreignKey: 'author_id' });
  User.hasMany(Comments, { foreignKey: 'author_id' });
  User.hasMany(Invitations, { as: 'SentInvitations', foreignKey: 'sender_id' });
  User.hasMany(Invitations, { as: 'ReceivedInvitations', foreignKey: 'receiver_id' });
  User.hasMany(Notifications, { as: 'SentNotifications', foreignKey: 'sender_id' });
  User.hasMany(Notifications, { as: 'ReceivedNotifications', foreignKey: 'receiver_id' });
  Group.belongsTo(User, { foreignKey: 'creator_id' });
  Group.hasMany(Group_members, { foreignKey: 'group_id' });
  Group.hasMany(Discussions, { foreignKey: 'group_id' });
  Group_members.belongsTo(Group, { foreignKey: 'group_id' });
  Group_members.belongsTo(User, { foreignKey: 'user_id' });
  Discussions.belongsTo(User, { foreignKey: 'author_id' });
  Discussions.belongsTo(Group, { foreignKey: 'group_id' });
  Discussions.hasMany(Comments, { foreignKey: 'discussion_id' });
  Comments.belongsTo(User, { foreignKey: 'author_id' });
  Comments.belongsTo(Discussions, { foreignKey: 'discussion_id' });
  Notifications.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
  Notifications.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });
  Invitations.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });
  Invitations.belongsTo(User, { as: 'Receiver', foreignKey: 'receiver_id' });
  Invitations.belongsTo(Group, { foreignKey: 'group_id' });
};

// Call the function to define associations
defineAssociations();


// Sync the models with the database
(async () => {
  try {
    await User.sync();
    await Group.sync();
    await Group_members.sync();
    await Discussions.sync();
    await Comments.sync();
    await Invitations.sync();
    await Notifications.sync();
    console.log('Models synced with the database successfully.');
  } catch (error) {
    console.error('Error syncing models with the database:', error);
  }
})();

module.exports = {
  Group_members,
  Comments,
  Discussions,
  Group,
  Invitations,
  Notifications,
  User
}