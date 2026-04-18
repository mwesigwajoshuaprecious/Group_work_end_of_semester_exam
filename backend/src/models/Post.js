const { sequelize, DataTypes } = require('../db');

const Post = sequelize.define('Post', {
  content: { type: DataTypes.TEXT, allowNull: false },
  pinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  groupId: { type: DataTypes.INTEGER, allowNull: false },
  authorId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Post;
