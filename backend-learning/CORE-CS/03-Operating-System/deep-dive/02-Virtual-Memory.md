# Virtual Memory - 가상 메모리

> "메모리를 속이는 마법"

## 🎯 핵심 개념

### 물리 메모리 vs 가상 메모리
```
물리 메모리 (RAM): 8GB

가상 메모리:
- Process A: 4GB 주소 공간
- Process B: 4GB 주소 공간
- Process C: 4GB 주소 공간
→ 총 12GB! (실제 RAM은 8GB)
```

## 📚 동작 원리

### 페이지 테이블
```
가상 주소 → 페이지 테이블 → 물리 주소

Process A:
Virtual     Physical
0x0000  →   0x2000  (매핑)
0x1000  →   0x5000
0x2000  →   Disk    (스왑 아웃)
```

## 💡 장점

1. **큰 주소 공간**: 물리 메모리보다 큰 프로그램 실행
2. **메모리 보호**: 프로세스 간 격리
3. **메모리 공유**: 라이브러리 공유 가능

## 🔍 페이지 폴트

```
1. CPU가 가상 주소 접근
2. 페이지 테이블 확인 → 없음!
3. Page Fault 발생
4. OS가 디스크에서 메모리로 로드
5. 페이지 테이블 업데이트
6. CPU 재실행
```

## ⚡ 최적화: TLB

**TLB (Translation Lookaside Buffer)**: 페이지 테이블 캐시

```
가상 주소 → TLB 확인 (빠름!)
  ↓ Hit
물리 주소

  ↓ Miss
페이지 테이블 → 물리 주소
```

## 🔗 다음 학습

- [03-Paging-Segmentation.md](./03-Paging-Segmentation.md)

---

**"가상 메모리 덕분에 메모리 부족을 겪지 않는다"**
