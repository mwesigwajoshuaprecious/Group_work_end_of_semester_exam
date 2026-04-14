"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid authentication token' });
    }
};
exports.requireAuth = requireAuth;
