/**
 * 간단한 HTTP 서버 예제
 *
 * 실행 방법:
 * node server.js
 *
 * 테스트:
 * curl http://localhost:3000
 * curl http://localhost:3000/api/users
 */

const http = require('http');

// 서버 생성
const server = http.createServer((req, res) => {
  // 요청 정보 로깅
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Client IP:', req.socket.remoteAddress);
  console.log('---');

  // 라우팅
  if (req.url === '/' && req.method === 'GET') {
    // 홈페이지
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>HTTP 서버 예제</title>
        </head>
        <body>
          <h1>안녕하세요! HTTP 서버입니다.</h1>
          <p>요청 메서드: ${req.method}</p>
          <p>요청 URL: ${req.url}</p>
          <p>클라이언트 IP: ${req.socket.remoteAddress}</p>

          <h2>API 테스트:</h2>
          <ul>
            <li><a href="/api/users">GET /api/users</a></li>
            <li><a href="/api/time">GET /api/time</a></li>
          </ul>
        </body>
      </html>
    `);

  } else if (req.url === '/api/users' && req.method === 'GET') {
    // 사용자 목록 API
    const users = [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
      { id: 3, name: 'Charlie', email: 'charlie@example.com' }
    ];

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({
      success: true,
      data: users
    }, null, 2));

  } else if (req.url === '/api/time' && req.method === 'GET') {
    // 현재 시간 API
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      success: true,
      timestamp: Date.now(),
      datetime: new Date().toISOString()
    }, null, 2));

  } else if (req.url.startsWith('/api/') && req.method === 'POST') {
    // POST 요청 처리
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(201, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          success: true,
          message: '데이터가 생성되었습니다',
          received: data
        }, null, 2));
      } catch (error) {
        res.writeHead(400, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
          success: false,
          error: '잘못된 JSON 형식입니다'
        }));
      }
    });

  } else {
    // 404 Not Found
    res.writeHead(404, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
      success: false,
      error: '페이지를 찾을 수 없습니다'
    }));
  }
});

// 포트 3000에서 서버 시작
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
  console.log('');
  console.log('테스트 명령어:');
  console.log(`  curl http://localhost:${PORT}`);
  console.log(`  curl http://localhost:${PORT}/api/users`);
  console.log(`  curl http://localhost:${PORT}/api/time`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/data -H "Content-Type: application/json" -d '{"name":"test"}'`);
  console.log('');
  console.log('종료: Ctrl+C');
  console.log('---');
});

// 우아한 종료
process.on('SIGTERM', () => {
  console.log('\n서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});
