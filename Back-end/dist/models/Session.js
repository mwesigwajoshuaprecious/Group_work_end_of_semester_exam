"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    group: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Session', sessionSchema);
