const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.js');
const groupRoutes = require('./routes/groups.js');
const sessionRoutes = require('./routes/sessions.js');
const postRoutes = require('./routes/posts.js');
const adminRoutes = require('./routes/admin.js');
const dashboardRoutes = require('./routes/dashboard.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Study Group Finder API' });
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const ALLOW_PORT_FALLBACK = process.env.ALLOW_PORT_FALLBACK !== 'false';

function listenWithFallback(initialPort) {
  const server = app.listen(initialPort, () => {
    console.log(`Backend running on http://localhost:${initialPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (!ALLOW_PORT_FALLBACK) {
        console.error(`Port ${initialPort} is already in use. Stop the other process or set PORT to a free port.`);
        process.exit(1);
      }

      const fallbackPort = initialPort + 1;
      console.warn(`Port ${initialPort} is in use. Retrying on ${fallbackPort}...`);
      listenWithFallback(fallbackPort);
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized');
    listenWithFallback(PORT);
  } catch (error) {
    console.error('Backend startup failed:', error);
    process.exit(1);
  }
}

startServer();
