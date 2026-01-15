# OSI 7계층과 TCP/IP 4계층

> "네트워크는 계층으로 이루어져 있다"

## 🎯 핵심 개념

### OSI 7계층
```
7. Application   (응용)     - HTTP, FTP, DNS
6. Presentation  (표현)     - 암호화, 압축
5. Session       (세션)     - 세션 관리
4. Transport     (전송)     - TCP, UDP
3. Network       (네트워크)  - IP, 라우팅
2. Data Link     (데이터링크)- Ethernet, MAC
1. Physical      (물리)     - 케이블, 전기신호
```

### TCP/IP 4계층 (실제 사용)
```
4. Application   - HTTP, DNS, FTP
3. Transport     - TCP, UDP
2. Internet      - IP
1. Network Access- Ethernet
```

## 📦 데이터 전송 과정

```
[Application]  "Hello"
     ↓ (HTTP 헤더 추가)
[Transport]    [TCP][Hello]
     ↓ (IP 헤더 추가)
[Internet]     [IP][TCP][Hello]
     ↓ (Ethernet 헤더 추가)
[Network]      [Eth][IP][TCP][Hello]
     ↓
    전송
```

## 💡 각 계층의 역할

### Application Layer (응용 계층)
```
- 사용자가 직접 사용
- 프로토콜: HTTP, HTTPS, DNS, FTP, SMTP
- 포트: 80 (HTTP), 443 (HTTPS), 53 (DNS)
```

### Transport Layer (전송 계층)
```
- 프로세스 간 통신
- TCP: 신뢰성 (연결, 순서, 에러 체크)
- UDP: 빠름 (연결 없음, 순서 없음)
- 포트 번호로 애플리케이션 구분
```

### Internet Layer (네트워크 계층)
```
- 라우팅 (경로 찾기)
- IP 주소로 호스트 구분
- 패킷 전달
```

### Network Access Layer (네트워크 접근 계층)
```
- 물리적 네트워크
- MAC 주소
- Ethernet, Wi-Fi
```

## 🔍 실제 예: 웹 페이지 요청

```
1. Application: HTTP GET / 요청 생성
2. Transport:   TCP 연결 (3-Way Handshake)
3. Internet:    IP 주소로 라우팅
4. Network:     Ethernet 프레임으로 전송

응답 과정은 역순:
4. Network:     프레임 수신
3. Internet:    IP 헤더 제거
2. Transport:   TCP 헤더 제거, 순서 확인
1. Application: HTML 파싱, 화면 출력
```

## 🎯 체크리스트

- [ ] OSI 7계층을 그림으로 그릴 수 있다
- [ ] TCP/IP 4계층을 이해한다
- [ ] 각 계층의 역할을 설명할 수 있다
- [ ] 데이터 캡슐화 과정을 안다

---

**"계층을 이해하면 네트워크 문제를 체계적으로 해결할 수 있다"**
