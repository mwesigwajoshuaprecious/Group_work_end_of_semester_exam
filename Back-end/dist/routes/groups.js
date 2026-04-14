"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Group_1 = __importDefault(require("../models/Group"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../utils/validate");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const groups = await Group_1.default.find().populate('leader', 'name program year email');
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
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parseResult = validate_1.groupSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    }
    const { title, course, description, location, faculty } = parseResult.data;
    const leader = req.userId;
    const group = new Group_1.default({ title, course, description, location, faculty, leader, members: [leader] });
    await group.save();
    res.status(201).json(group);
});
router.patch('/:id', auth_1.requireAuth, async (req, res) => {
    const group = await Group_1.default.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (group.leader.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only group leader can update the group' });
    }
    const parseResult = validate_1.groupSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    }
    Object.assign(group, parseResult.data);
    await group.save();
    res.json(group);
});
router.post('/:id/join', auth_1.requireAuth, async (req, res) => {
    const group = await Group_1.default.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (group.members.includes(req.userId)) {
        return res.status(400).json({ error: 'You already belong to this group' });
    }
    group.members.push(req.userId);
    await group.save();
    res.json({ message: 'Joined study group successfully', members: group.members.length });
});
router.post('/:id/leave', auth_1.requireAuth, async (req, res) => {
    const group = await Group_1.default.findById(req.params.id);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    group.members = group.members.filter((member) => member.toString() !== req.userId);
    await group.save();
    res.json({ message: 'Left study group', members: group.members.length });
});
router.get('/:id', async (req, res) => {
    const group = await Group_1.default.findById(req.params.id).populate('leader', 'name');
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
});
router.get('/search', async (req, res) => {
    const { course, faculty, title } = req.query;
    const query = {};
    if (course)
        query.course = { $regex: `${course}`, $options: 'i' };
    if (faculty)
        query.faculty = { $regex: `${faculty}`, $options: 'i' };
    if (title)
        query.title = { $regex: `${title}`, $options: 'i' };
    const groups = await Group_1.default.find(query).limit(50);
    res.json(groups);
});
exports.default = router;
