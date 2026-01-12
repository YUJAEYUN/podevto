const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Redis Connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

// Auth Service URL
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://auth:3002';

// ==================== Middleware ====================

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with auth service
    const response = await axios.post(`${AUTH_SERVICE}/verify`, { token });
    req.user = response.data.user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== Routes ====================

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({
      status: 'healthy',
      service: 'api',
      database: 'connected',
      cache: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'API Service',
    version: '1.0.0',
    endpoints: [
      'GET  /health',
      'GET  /api/items',
      'POST /api/items',
      'GET  /api/items/:id',
      'PUT  /api/items/:id',
      'DELETE /api/items/:id',
      'GET  /api/stats'
    ]
  });
});

// Get all items (with caching)
app.get('/api/items', authenticate, async (req, res) => {
  try {
    // Check cache
    const cached = await redis.get('items:all');
    if (cached) {
      console.log('📦 Cache hit');
      return res.json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    // Query database
    const result = await pool.query(
      'SELECT * FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    // Cache for 60 seconds
    await redis.setex('items:all', 60, JSON.stringify(result.rows));

    console.log('💾 Cache miss - fetched from DB');
    res.json({
      source: 'database',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create item
app.post('/api/items', authenticate, async (req, res) => {
  try {
    const { title, description } = req.body;

    const result = await pool.query(
      'INSERT INTO items (title, description, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [title, description, req.user.id]
    );

    // Invalidate cache
    await redis.del('items:all');

    console.log(`✅ Item created: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single item
app.get('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache
    const cached = await redis.get(`item:${id}`);
    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    const result = await pool.query(
      'SELECT * FROM items WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Cache for 300 seconds
    await redis.setex(`item:${id}`, 300, JSON.stringify(result.rows[0]));

    res.json({
      source: 'database',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update item
app.put('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const result = await pool.query(
      'UPDATE items SET title = $1, description = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, description, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Invalidate cache
    await redis.del('items:all', `item:${id}`);

    console.log(`✏️ Item updated: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete item
app.delete('/api/items/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Invalidate cache
    await redis.del('items:all', `item:${id}`);

    console.log(`🗑️ Item deleted: ${id}`);
    res.json({ message: 'Item deleted', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stats
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const cached = await redis.get(`stats:${req.user.id}`);
    if (cached) {
      return res.json({
        source: 'cache',
        data: JSON.parse(cached)
      });
    }

    const result = await pool.query(
      'SELECT COUNT(*) as total FROM items WHERE user_id = $1',
      [req.user.id]
    );

    const stats = {
      totalItems: parseInt(result.rows[0].total),
      userId: req.user.id,
      username: req.user.username
    };

    await redis.setex(`stats:${req.user.id}`, 120, JSON.stringify(stats));

    res.json({
      source: 'database',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// ==================== Start Server ====================

app.listen(PORT, '0.0.0.0', async () => {
  console.log('='.repeat(50));
  console.log(`🚀 API Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${pool.options.host}`);
  console.log(`📦 Redis: ${redis.options.host}:${redis.options.port}`);
  console.log(`🔐 Auth Service: ${AUTH_SERVICE}`);
  console.log('='.repeat(50));

  // Test database connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📴 SIGTERM received. Closing connections...');
  await pool.end();
  await redis.quit();
  process.exit(0);
});
