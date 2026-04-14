"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const validate_1 = require("../utils/validate");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
router.post('/register', async (req, res) => {
    const parseResult = validate_1.registerSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    }
    const { name, program, year, email, password } = parseResult.data;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email is already registered' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = new User_1.default({ name, program, year, email, password: hashedPassword });
    await user.save();
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, program: user.program, year: user.year, email: user.email } });
});
router.post('/login', async (req, res) => {
    const parseResult = validate_1.loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.flatten().fieldErrors });
    }
    const { email, password } = parseResult.data;
    const user = await User_1.default.findOne({ email });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, program: user.program, year: user.year, email: user.email } });
});
router.get('/me', auth_1.requireAuth, async (req, res) => {
    const user = await User_1.default.findById(req.userId).select('-password');
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
});
exports.default = router;
