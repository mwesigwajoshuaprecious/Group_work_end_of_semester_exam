"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSchema = exports.groupSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    program: zod_1.z.string().min(2),
    year: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6)
});
exports.groupSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    course: zod_1.z.string().min(2),
    description: zod_1.z.string().min(10),
    location: zod_1.z.string().min(2),
    faculty: zod_1.z.string().optional()
});
exports.sessionSchema = zod_1.z.object({
    groupId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(3),
    date: zod_1.z.string().min(8),
    time: zod_1.z.string().min(4),
    location: zod_1.z.string().min(2),
    description: zod_1.z.string().min(10)
});
