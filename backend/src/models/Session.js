const { sequelize, DataTypes } = require('../db');

const Session = sequelize.define('Session', {
  title: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  groupId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Session;
