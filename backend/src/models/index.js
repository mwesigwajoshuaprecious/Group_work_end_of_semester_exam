const { sequelize } = require('../db');
const User = require('./User');
const Group = require('./Group');
const Session = require('./Session');
const Post = require('./Post');
const Comment = require('./Comment');

const GroupMembers = sequelize.define('GroupMembers', {}, {
  timestamps: true,
  updatedAt: false
});

User.hasMany(Group, { foreignKey: 'leaderId', onDelete: 'CASCADE' });
Group.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });

User.belongsToMany(Group, {
  through: GroupMembers,
  as: 'memberGroups',
  foreignKey: 'userId',
  otherKey: 'groupId',
  onDelete: 'CASCADE'
});
Group.belongsToMany(User, {
  through: GroupMembers,
  as: 'members',
  foreignKey: 'groupId',
  otherKey: 'userId',
  onDelete: 'CASCADE'
});

Group.hasMany(Session, { foreignKey: 'groupId', onDelete: 'CASCADE' });
Session.belongsTo(Group, { foreignKey: 'groupId' });

Group.hasMany(Post, { foreignKey: 'groupId', onDelete: 'CASCADE' });
Post.belongsTo(Group, { foreignKey: 'groupId' });

User.hasMany(Post, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Post.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

Post.hasMany(Comment, { as: 'comments', foreignKey: 'postId', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Comment, { foreignKey: 'authorId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { as: 'author', foreignKey: 'authorId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentCommentId', onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentCommentId' });

module.exports = { sequelize, User, Group, Session, Post, Comment };