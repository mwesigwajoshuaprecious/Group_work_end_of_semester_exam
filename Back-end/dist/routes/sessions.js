"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Session_1 = __importDefault(require("../models/Session"));
const Group_1 = __importDefault(require("../models/Group"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../utils/validate");
const router = (0, express_1.Router)();
router.get('/group/:groupId', async (req, res) => {
    const sessions = await Session_1.default.find({ group: req.params.groupId }).sort({ date: 1, time: 1 });
    res.json(sessions);
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    const parseResult = validate_1.sessionSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    }
    const { groupId, title, date, time, location, description } = parseResult.data;
    const group = await Group_1.default.findById(groupId);
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    }
    if (group.leader.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only group leader can schedule sessions' });
    }
    const session = new Session_1.default({ group: groupId, title, date, time, location, description });
    await session.save();
    res.status(201).json(session);
});
exports.default = router;
