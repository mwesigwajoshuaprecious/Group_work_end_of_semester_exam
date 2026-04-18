const { sequelize, DataTypes } = require('../db');

const Group = sequelize.define('Group', {
  title: { type: DataTypes.STRING, allowNull: false },
  course: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  faculty: { type: DataTypes.STRING, allowNull: true },
  leaderId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Group;
