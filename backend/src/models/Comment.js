const { sequelize, DataTypes } = require('../db');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  postId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  authorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  parentCommentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
});

module.exports = Comment;
