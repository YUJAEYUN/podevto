-- ==================== Database Initialization ====================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Users Table ====================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ==================== Items Table ====================
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- ==================== Sessions Table ====================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ==================== Audit Log Table ====================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ==================== Sample Data ====================

-- Insert sample users (password: password123)
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@example.com', '$2a$10$rGXvQF5vQFZ5F5F5F5F5FeY0F5F5F5F5F5F5F5F5F5F5F5F5F5F5Fy'),
('testuser', 'test@example.com', '$2a$10$rGXvQF5vQFZ5F5F5F5F5FeY0F5F5F5F5F5F5F5F5F5F5F5F5F5F5Fy')
ON CONFLICT (username) DO NOTHING;

-- Insert sample items
INSERT INTO items (user_id, title, description) VALUES
(1, 'Docker Tutorial', 'Learn Docker containerization'),
(1, 'Kubernetes Guide', 'Master container orchestration'),
(2, 'Microservices Pattern', 'Design patterns for microservices')
ON CONFLICT DO NOTHING;

-- ==================== Functions ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for items table
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== Views ====================

-- User statistics view
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    u.email,
    COUNT(DISTINCT i.id) as total_items,
    COUNT(DISTINCT s.id) as active_sessions,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN items i ON u.id = i.user_id
LEFT JOIN sessions s ON u.id = s.user_id AND s.is_valid = TRUE AND s.expires_at > NOW()
GROUP BY u.id, u.username, u.email, u.created_at, u.last_login;

-- Recent activity view
CREATE OR REPLACE VIEW recent_activity AS
SELECT
    'item_created' as activity_type,
    i.user_id,
    u.username,
    i.title as activity_description,
    i.created_at
FROM items i
JOIN users u ON i.user_id = u.id
ORDER BY i.created_at DESC
LIMIT 50;

-- ==================== Permissions ====================

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ==================== Completion ====================

DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'Tables created: users, items, sessions, audit_logs';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE 'Default credentials: username=admin, password=password123';
END $$;
