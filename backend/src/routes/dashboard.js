const express = require('express');
const { Op } = require('sequelize');
const { User, Group, Session } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', requireAuth, async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const user = await User.findByPk(req.userId, {
    include: [
      {
        model: Group,
        as: 'memberGroups',
        include: [
          { model: User, as: 'leader', attributes: ['id', 'name', 'program', 'year', 'email'] },
          { model: User, as: 'members', attributes: ['id'] }
        ]
      }
    ]
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const myGroups = user.memberGroups.map((group) => ({
    id: group.id,
    title: group.title,
    course: group.course,
    description: group.description,
    location: group.location,
    faculty: group.faculty,
    leader: group.leader,
    members: group.members.length
  }));

  const groupIds = myGroups.map((group) => group.id);
  let upcomingSessions = [];

  if (groupIds.length) {
    const sessions = await Session.findAll({
      where: { groupId: groupIds },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    const groupTitles = Object.fromEntries(myGroups.map((group) => [group.id, group.title]));
    const today = new Date().toISOString().slice(0, 10);

    upcomingSessions = sessions
      .filter((session) => session.date >= today)
      .map((session) => ({
        _id: session.id,
        title: session.title,
        date: session.date,
        time: session.time,
        location: session.location,
        description: session.description,
        groupId: session.groupId,
        groupTitle: groupTitles[session.groupId] || 'Study group'
      }));
  }

  const recentGroups = await Group.findAll({
    include: [
      { model: User, as: 'leader', attributes: ['id', 'name'] },
      { model: User, as: 'members', attributes: ['id'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: 5
  });

  const newGroupsThisWeek = await Group.count({
    where: {
      createdAt: { [Op.gte]: startOfWeek }
    }
  });

  res.json({
    myGroups,
    upcomingSessions,
    recentGroups: recentGroups.map((group) => ({
      id: group.id,
      title: group.title,
      course: group.course,
      description: group.description,
      location: group.location,
      faculty: group.faculty,
      leader: group.leader,
      members: group.members.length
    })),
    newGroupsThisWeek
  });
});

module.exports = router;
