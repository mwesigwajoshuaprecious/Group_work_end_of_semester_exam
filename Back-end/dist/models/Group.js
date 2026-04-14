"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const groupSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    faculty: { type: String },
    leader: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Group', groupSchema);
