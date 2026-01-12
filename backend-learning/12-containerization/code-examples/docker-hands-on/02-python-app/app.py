from flask import Flask, jsonify, request
import os
import sys
import redis
from datetime import datetime

app = Flask(__name__)

# Redis 연결
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True
    )
    redis_client.ping()
    print("✅ Redis connected")
except Exception as e:
    print(f"❌ Redis connection failed: {e}")
    redis_client = None

@app.route('/health')
def health():
    redis_status = 'connected' if redis_client else 'disconnected'
    try:
        if redis_client:
            redis_client.ping()
    except:
        redis_status = 'error'

    return jsonify({
        'status': 'healthy',
        'service': 'python-api',
        'redis': redis_status,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/')
def index():
    return jsonify({
        'message': 'Hello from Python Flask! 🐍',
        'version': '1.0.0',
        'python_version': sys.version,
        'environment': os.getenv('FLASK_ENV', 'development'),
        'containerized': True
    })

@app.route('/cache/set', methods=['POST'])
def set_cache():
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    data = request.get_json()
    key = data.get('key')
    value = data.get('value')
    ttl = data.get('ttl', 300)  # 기본 5분

    if not key or not value:
        return jsonify({'error': 'key and value required'}), 400

    redis_client.setex(key, ttl, value)
    return jsonify({
        'message': 'Cache set successfully',
        'key': key,
        'ttl': ttl
    })

@app.route('/cache/get/<key>')
def get_cache(key):
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    value = redis_client.get(key)
    if value is None:
        return jsonify({'error': 'Key not found'}), 404

    ttl = redis_client.ttl(key)
    return jsonify({
        'key': key,
        'value': value,
        'ttl': ttl
    })

@app.route('/cache/delete/<key>', methods=['DELETE'])
def delete_cache(key):
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    deleted = redis_client.delete(key)
    if deleted == 0:
        return jsonify({'error': 'Key not found'}), 404

    return jsonify({'message': 'Cache deleted', 'key': key})

@app.route('/counter')
def counter():
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    count = redis_client.incr('visit_counter')
    return jsonify({
        'message': 'Visit counter',
        'visits': count
    })

@app.route('/counter/reset', methods=['POST'])
def reset_counter():
    if not redis_client:
        return jsonify({'error': 'Redis not available'}), 503

    redis_client.set('visit_counter', 0)
    return jsonify({'message': 'Counter reset', 'visits': 0})

@app.route('/info')
def info():
    return jsonify({
        'service': 'Python Flask API',
        'python_version': sys.version,
        'flask_env': os.getenv('FLASK_ENV', 'development'),
        'redis_host': os.getenv('REDIS_HOST', 'localhost'),
        'redis_port': os.getenv('REDIS_PORT', 6379),
        'redis_status': 'connected' if redis_client else 'disconnected',
        'endpoints': [
            'GET  /',
            'GET  /health',
            'GET  /info',
            'POST /cache/set',
            'GET  /cache/get/<key>',
            'DELETE /cache/delete/<key>',
            'GET  /counter',
            'POST /counter/reset'
        ]
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'

    print('=' * 50)
    print(f'🚀 Flask server starting on port {port}')
    print(f'📝 Environment: {os.getenv("FLASK_ENV", "development")}')
    print(f'🐍 Python: {sys.version.split()[0]}')
    print(f'📦 Redis: {os.getenv("REDIS_HOST", "localhost")}:{os.getenv("REDIS_PORT", 6379)}')
    print('=' * 50)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
