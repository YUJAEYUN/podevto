const express = require('express');
const { Pool } = require('pg');
const Redis = require('ioredis');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

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

// ==================== Routes ====================

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({
      status: 'healthy',
      service: 'auth',
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
    service: 'Auth Service',
    version: '1.0.0',
    endpoints: [
      'GET  /health',
      'POST /register',
      'POST /login',
      'POST /logout',
      'POST /verify',
      'POST /refresh'
    ]
  });
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (username, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Store token in Redis (for session management)
    await redis.setex(`token:${token}`, 86400, JSON.stringify({
      userId: user.id,
      username: user.username
    }));

    console.log(`✅ User registered: ${user.username}`);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Store token in Redis
    await redis.setex(`token:${token}`, 86400, JSON.stringify({
      userId: user.id,
      username: user.username
    }));

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    console.log(`✅ User logged in: ${user.username}`);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Remove token from Redis
    await redis.del(`token:${token}`);

    console.log('✅ User logged out');

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token
app.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Check if token is in Redis (not blacklisted)
    const sessionData = await redis.get(`token:${token}`);
    if (!sessionData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
app.post('/refresh', async (req, res) => {
  try {
    const oldToken = req.headers.authorization?.split(' ')[1];

    if (!oldToken) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Verify old token
    const decoded = jwt.verify(oldToken, JWT_SECRET, { ignoreExpiration: true });

    // Generate new token
    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, email: decoded.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Remove old token and store new one
    await redis.del(`token:${oldToken}`);
    await redis.setex(`token:${newToken}`, 86400, JSON.stringify({
      userId: decoded.id,
      username: decoded.username
    }));

    console.log(`✅ Token refreshed for user: ${decoded.username}`);

    res.json({
      message: 'Token refreshed',
      token: newToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get current user
app.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const result = await pool.query(
      'SELECT id, username, email, created_at, last_login FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
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
  console.log(`🚀 Auth Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${pool.options.host}`);
  console.log(`📦 Redis: ${redis.options.host}:${redis.options.port}`);
  console.log(`🔐 JWT Expiry: ${JWT_EXPIRY}`);
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
