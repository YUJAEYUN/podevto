# DBeaver 학습 자료

이 폴더는 DBeaver 오픈소스 프로젝트를 학습하기 위한 자료를 모아둔 곳입니다.

## 📂 폴더 구조

```
dbeaver-learning/
├── README.md              # 이 파일
├── LEARNING_GUIDE.md      # DBeaver 학습 가이드
├── notes/                 # 학습 노트
├── code-examples/         # 코드 예제
└── resources/             # 추가 자료
```

## 🎯 학습 목표

- DBeaver의 내부 구조와 구현 방식 이해
- 100+ 데이터베이스를 지원하는 아키텍처 분석
- 다른 DB 관리 툴(DataGrip, SQL Developer 등)과의 차이점 파악
- Eclipse RCP와 OSGi 플러그인 시스템이 어떻게 활용되는지 학습(RCP는 클라이언트 프레임워크, OSGI는 동적 모듈 시스템)
- 실제 사용해온 기능들이 코드 레벨에서 어떻게 구현되어 있는지 확인

## 📚 주요 문서

- [LEARNING_GUIDE.md](LEARNING_GUIDE.md) - DBeaver 종합 학습 가이드

## 🔗 관련 링크

- **원본 저장소**: https://github.com/dbeaver/dbeaver
- **포크 저장소**: https://github.com/YUJAEYUN/dbeaver
- **로컬 저장소**: `/Users/user/Desktop/podevto/dbeaver/`

## 💡 빠른 시작

```bash
# DBeaver 저장소로 이동
cd /Users/user/Desktop/podevto/dbeaver

# 최신 변경사항 가져오기
git fetch upstream
git merge upstream/devel

# 빌드
mvn clean install
```

## 📝 학습 진행 상황

- [ ] Level 1: 프로젝트 구조 파악 (1-2주)
- [ ] Level 2: 핵심 컴포넌트 이해 (2-4주)
- [ ] Level 3: 기여 가능한 수준 (4-8주)
- [ ] Level 4: 메인테이너 수준 (지속적)

---

**시작일**: 2025-12-19
