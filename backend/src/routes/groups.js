const express = require('express');
const { Op } = require('sequelize');
const { Group, User } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { groupSchema } = require('../utils/validate');

const router = express.Router();

router.get('/', async (_req, res) => {
  const groups = await Group.findAll({
    include: [
      { model: User, as: 'leader', attributes: ['id', 'name', 'program', 'year', 'email'] },
      { model: User, as: 'members', attributes: ['id'] }
    ]
  });

  res.json(groups.map((group) => ({
    id: group.id,
    title: group.title,
    course: group.course,
    description: group.description,
    location: group.location,
    faculty: group.faculty,
    leader: group.leader,
    members: group.members.length
  })));
});

router.post('/', requireAuth, async (req, res) => {
  const parseResult = groupSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
  }

  const { title, course, description, location, faculty } = parseResult.data;
  const group = await Group.create({ title, course, description, location, faculty, leaderId: req.userId });
  await group.addMember(req.userId);

  res.status(201).json({
    id: group.id,
    title: group.title,
    course: group.course,
    description: group.description,
    location: group.location,
    faculty: group.faculty,
    leaderId: group.leaderId,
    members: 1
  });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only group leader can update the group' });
  }

  const parseResult = groupSchema.partial().safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
  }

  await group.update(parseResult.data);
  res.json(group);
});

router.post('/:id/join', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const isMember = await group.hasMember(req.userId);
  if (isMember) {
    return res.status(400).json({ error: 'You already belong to this group' });
  }

  await group.addMember(req.userId);
  const memberCount = await group.countMembers();
  res.json({ message: 'Joined study group successfully', members: memberCount });
});

router.post('/:id/leave', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  await group.removeMember(req.userId);
  const memberCount = await group.countMembers();
  res.json({ message: 'Left study group', members: memberCount });
});

router.post('/:id/remove-member', requireAuth, async (req, res) => {
  const { memberId } = req.body;
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only group leader can remove members' });
  }
  if (Number(memberId) === group.leaderId) {
    return res.status(400).json({ error: 'Group leader cannot be removed from their own group' });
  }

  await group.removeMember(memberId);
  res.json({ message: 'Member removed successfully' });
});

router.get('/:id/members', requireAuth, async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: [{ model: User, as: 'members', attributes: ['id', 'name', 'program', 'year', 'email'] }]
  });
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }
  if (group.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only group leader can view members list' });
  }

  res.json({ members: group.members, leaderId: group.leaderId });
});

router.get('/my', requireAuth, async (req, res) => {
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

  res.json(user.memberGroups.map((group) => ({
    id: group.id,
    title: group.title,
    course: group.course,
    description: group.description,
    location: group.location,
    faculty: group.faculty,
    leader: group.leader,
    members: group.members.length
  })));
});

router.get('/search', async (req, res) => {
  const { course, faculty, title } = req.query;
  const where = {};

  if (course) where.course = { [Op.like]: `%${course}%` };
  if (faculty) where.faculty = { [Op.like]: `%${faculty}%` };
  if (title) where.title = { [Op.like]: `%${title}%` };

  const groups = await Group.findAll({ where, limit: 50 });
  res.json(groups);
});

router.get('/:id', async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: [
      { model: User, as: 'leader', attributes: ['id', 'name'] },
      { model: User, as: 'members', attributes: ['id', 'name', 'program', 'year', 'email'] }
    ]
  });

  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  res.json(group);
});

module.exports = router;
