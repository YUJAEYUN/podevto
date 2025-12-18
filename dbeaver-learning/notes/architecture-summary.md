# DBeaver 아키텍처 요약

## 핵심 계층 구조

```
UI Layer (Eclipse RCP/SWT)
    ↓
Model Layer (Business Logic)
    ↓
Data Access Layer (JDBC)
```

## 주요 플러그인

### Core Plugins
- `org.jkiss.dbeaver.model` - 데이터 모델 인터페이스
- `org.jkiss.dbeaver.model.sql` - SQL 파싱/분석
- `org.jkiss.dbeaver.registry` - 플러그인 레지스트리
- `org.jkiss.dbeaver.core` - 핵심 UI 애플리케이션

### UI Plugins
- `org.jkiss.dbeaver.ui.editors.sql` - SQL 에디터
- `org.jkiss.dbeaver.ui.editors.data` - 데이터 에디터
- `org.jkiss.dbeaver.ui.navigator` - DB 네비게이터

### Database Extensions (69개)
- PostgreSQL, MySQL, Oracle, SQL Server 등
- 각 DB마다 모델 + UI 플러그인 쌍

## 핵심 인터페이스

```java
DBPDataSource           // 데이터소스
DBCExecutionContext     // 실행 컨텍스트
DBCSession              // 세션
DBSObject               // DB 객체 (테이블, 컬럼 등)
```

## OSGi 확장 포인트

- `dataSourceProvider` - 새 DB 드라이버 추가
- `sql.editorContributor` - SQL 에디터 확장
- `dataTypeProvider` - 데이터 타입 핸들러

## 메모

- Eclipse RCP 기반이라 학습 곡선이 있음
- 플러그인 시스템 덕분에 확장이 용이
- 메타데이터 캐싱으로 성능 최적화
- CloudBeaver와 백엔드 공유
