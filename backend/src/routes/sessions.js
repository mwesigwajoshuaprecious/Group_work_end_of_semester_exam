const express = require('express');
const { Session, Group } = require('../models');
const { requireAuth } = require('../middleware/auth');
const { sessionSchema } = require('../utils/validate');

const router = express.Router();

router.get('/group/:groupId', async (req, res) => {
  const sessions = await Session.findAll({
    where: { groupId: req.params.groupId },
    order: [['date', 'ASC'], ['time', 'ASC']]
  });
  res.json(sessions);
});

router.post('/', requireAuth, async (req, res) => {
  const parseResult = sessionSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
  }

  const { groupId, title, date, time, location, description } = parseResult.data;
  const group = await Group.findByPk(groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (group.leaderId !== req.userId) {
    return res.status(403).json({ error: 'Only group leader can schedule sessions' });
  }

  const session = await Session.create({ groupId, title, date, time, location, description });
  res.status(201).json(session);
});

module.exports = router;
