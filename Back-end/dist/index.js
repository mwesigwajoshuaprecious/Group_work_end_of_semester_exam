"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const groups_1 = __importDefault(require("./routes/groups"));
const sessions_1 = __importDefault(require("./routes/sessions"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/groups', groups_1.default);
app.use('/api/sessions', sessions_1.default);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Study Group Finder API' });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-group-finder';
mongoose_1.default.set('strictQuery', false);
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    app.listen(PORT, () => {
        console.log(`Backend running on http://localhost:${PORT}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
});
