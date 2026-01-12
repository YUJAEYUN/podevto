# Docker 실습 프로젝트

Docker를 실전에서 사용하는 방법을 배우는 hands-on 프로젝트 모음입니다.

## 📁 프로젝트 구조

```
docker-hands-on/
├── 01-node-app/              # Node.js 애플리케이션 컨테이너화
├── 02-python-app/            # Python Flask 애플리케이션
├── 03-go-app/                # Go 애플리케이션 (멀티 스테이지)
├── 04-multi-stage/           # 멀티 스테이지 빌드 심화
├── 05-compose-microservices/ # Docker Compose로 마이크로서비스
├── 06-production-ready/      # 프로덕션 레디 설정
└── 07-monitoring/            # 모니터링 스택
```

## 🎯 학습 목표

1. **기본 컨테이너화**: 애플리케이션을 Docker 이미지로 만들기
2. **최적화**: 이미지 크기 줄이고 빌드 시간 단축
3. **보안**: 최소 권한, 비root 사용자
4. **Docker Compose**: 여러 서비스 연동
5. **프로덕션**: 실제 운영 환경을 위한 설정

## 📚 학습 순서

### Level 1: 기초 (1-2시간)
1. Node.js 앱 컨테이너화
2. Python Flask 앱 컨테이너화

### Level 2: 중급 (2-3시간)
3. Go 앱 멀티 스테이지 빌드
4. Docker Compose 마이크로서비스

### Level 3: 고급 (3-4시간)
5. 프로덕션 최적화
6. 모니터링 스택 구축

## 🚀 시작하기

각 프로젝트 디렉토리의 README.md를 따라 진행하세요.

```bash
cd 01-node-app
cat README.md
```

---

*Happy Dockering!* 🐳
