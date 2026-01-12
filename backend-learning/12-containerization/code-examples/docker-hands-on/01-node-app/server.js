const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Docker! 🐳',
    environment: process.env.NODE_ENV || 'development',
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version,
    containerized: true
  });
});

// In-memory data store
let data = [];

// Get all data
app.get('/api/data', (req, res) => {
  res.json({
    total: data.length,
    items: data
  });
});

// Create data
app.post('/api/data', (req, res) => {
  const item = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    ...req.body
  };
  data.push(item);
  console.log(`Created item: ${item.id}`);
  res.status(201).json(item);
});

// Get single item
app.get('/api/data/:id', (req, res) => {
  const item = data.find(d => d.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

// Delete item
app.delete('/api/data/:id', (req, res) => {
  const index = data.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const deleted = data.splice(index, 1)[0];
  console.log(`Deleted item: ${deleted.id}`);
  res.json(deleted);
});

// System info endpoint
app.get('/api/system', (req, res) => {
  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
    loadAverage: os.loadavg()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🖥️  Hostname: ${os.hostname()}`);
  console.log(`💻 Platform: ${os.platform()}`);
  console.log(`📦 Node.js: ${process.version}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  GET  /api/data');
  console.log('  POST /api/data');
  console.log('  GET  /api/data/:id');
  console.log('  DELETE /api/data/:id');
  console.log('  GET  /api/system');
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
