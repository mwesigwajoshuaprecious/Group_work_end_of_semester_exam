const express = require('express');
const { sequelize, User, Group } = require('../models');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const requireAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }
  next();
};

router.use(requireAuth, requireAdmin);

router.get('/overview', async (_req, res) => {
  const userCount = await User.count();
  const groupCount = await Group.count();
  const courseAggregation = await Group.findAll({
    attributes: ['course', [sequelize.fn('COUNT', sequelize.col('course')), 'count']],
    group: ['course'],
    order: [[sequelize.literal('count'), 'DESC']],
    limit: 5
  });

  res.json({
    totalUsers: userCount,
    totalGroups: groupCount,
    activeCourses: courseAggregation.map((item) => ({ course: item.course, groups: Number(item.get('count')) }))
  });
});

router.get('/users', async (_req, res) => {
  const users = await User.findAll({ attributes: ['id', 'name', 'program', 'year', 'email', 'role'] });
  res.json(users);
});

router.get('/groups', async (_req, res) => {
  const groups = await Group.findAll({
    include: [
      { model: User, as: 'leader', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'members', attributes: ['id'] }
    ]
  });

  res.json(groups.map((group) => ({
    id: group.id,
    title: group.title,
    course: group.course,
    location: group.location,
    leader: group.leader,
    members: group.members.length
  })));
});

router.post('/users/:id/promote', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  user.role = 'admin';
  await user.save();
  res.json({ message: 'User promoted to admin successfully' });
});

router.delete('/groups/:id', async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  await group.destroy();
  res.json({ message: 'Group deleted successfully' });
});

module.exports = router;
