const Group_members = require("./schema/Group_members");
const Comments = require("./schema/comments");
const Discussions = require("./schema/discussions");
const Group = require("./schema/group");
const Invitations = require("./schema/invitations");
const Notifications = require("./schema/notifications");
const User = require("./schema/user");

User.hasMany(Group_members, { foreignKey: 'user_id' });
Group_members.belongsTo(User, { foreignKey: 'user_id' });

Group.hasMany(Group_members, { foreignKey: 'group_id' });
Group_members.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(Discussions, { foreignKey: 'author_id' });
Discussions.belongsTo(User, { foreignKey: 'author_id' });

Group.hasMany(Discussions, { foreignKey: 'group_id' });
Discussions.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(Comments, { foreignKey: 'author_id' });
Comments.belongsTo(User, { foreignKey: 'author_id' });

Discussions.hasMany(Comments, { foreignKey: 'discussion_id' });
Comments.belongsTo(Discussions, { foreignKey: 'discussion_id' });

User.hasMany(Invitations, { foreignKey: 'sender_id' });
Invitations.belongsTo(User, { foreignKey: 'sender_id' });

User.hasMany(Invitations, { foreignKey: 'receiver_id' });
Invitations.belongsTo(User, { foreignKey: 'receiver_id' });

Group.hasMany(Invitations, { foreignKey: 'group_id' });
Invitations.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(Notifications, { foreignKey: 'sender_id' });
Notifications.belongsTo(User, { foreignKey: 'sender_id' });

User.hasMany(Notifications, { foreignKey: 'receiver_id' });
Notifications.belongsTo(User, { foreignKey: 'receiver_id' });

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