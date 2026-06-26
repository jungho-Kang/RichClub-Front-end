# RichClub

> AI 기반 주식 매매 신호 플랫폼

AI가 매수/매도 신호를 분석하고, 백테스트와 투자 시뮬레이션을 통해 전략의 신뢰도를 검증할 수 있는 주식 분석 서비스입니다.

---

## 기술 스택

| 분류      | 기술               |
| --------- | ------------------ |
| Framework | React + TypeScript |
| Styling   | Tailwind CSS       |
| 상태관리  | Zustand            |
| 폼 관리   | React Hook Form    |
| HTTP      | Axios              |
| 알림      | SweetAlert2        |
| 라우팅    | React Router       |
| 차트      | lightweight-charts |

---

## 주요 기능

### 인증

- 이메일 인증 기반 회원가입 (3단계: 이메일 → 인증코드 → 닉네임/비밀번호)
- 인증코드 5분 타이머, 재전송
- 비밀번호 찾기 (3단계: 이메일 → 인증코드 → 비밀번호 변경)
- 쿠키 기반 accessToken 인증

### 차트

- 캔들차트 + 이동평균선 (MA5 / MA20 / MA60)
- 일목균형표 (전환선 / 기준선 / 후행스팬 / 선행스팬1 / 선행스팬2)
- AI 매수(BUY) / 매도(SELL) 신호 차트에 마커로 표시
- MA 정배열 / 역배열 감지
- RSI (10, 9) — 과매수 / 과매도 / 70 하방 이탈 감지
- MACD (12, 26, 9) — MACD선 vs Signal선 정배열 / 역배열 비교
- 마우스 hover 시 tooltip (시가 / 고가 / 저가 / 종가 / MA / RSI / MACD 등)
- 기간 선택 + MA 계열 토글

### AI 예측 종목 리스트

- AI 예측 / 관심종목 탭 전환
- AI 예측: 매수 / 매도 탭, 종목명 / 코드 / 현재가 / 등락률 / AI 신뢰도
- 관심종목 추가 / 제거
- 비로그인 시 종목 정보 블러 처리

### AI 백테스트

- 4가지 전략 모드
  - **AI**: AI 매수 신호 + MA60 상승 중 / AI 매도 신호 (침체구간 제외)
  - **5일선**: AI 매수 + MA60 하락 제외 / 5일선 꺾임 매도
  - **AI+지표**: AI + MA 정배열 + MA60 상승 / AI 매도 or MA 역배열
  - **지표**: MA 정배열 + MA60 상승 진입 / MA 역배열 매도
- 기간 선택: 1m / 3m / 6m / all
- 날짜 직접 입력 (YYMMDD) + 조회
- 종목 변경 시 자동 재조회
- 거래 내역 (B/S 뱃지 / 날짜 / 수익률 / 보유중 / 미실현)
- 누적 요약 (승률 / 적중률 / 평균 수익률)
- 투자 시뮬레이터 (금액 입력 / 빠른 선택 / 수익금 / 최종금액)
- 로딩 중 skeleton UI

### 기타

- 시장지표 리스트
- 뉴스 리스트
- 매매일지 작성

---

## 화면 구성

```
┌─────────────────────────────────────────────────────┐
│                      Header                          │
├──────────────────────────────┬──────────────────────┤
│  종목 카드                    │  AI 예측 종목 리스트  │
│  (종목명 / 현재가 / 등락률)   │                      │
├──────────────────────────────┤  AI 백테스트          │
│  차트 컨트롤                  │  (승률 / 거래내역 /  │
│  (기간 선택 / MA 토글)        │   투자 시뮬레이터)   │
├──────────────────────────────┤                      │
│  가격 · 이동평균선 차트        │  매매일지 버튼       │
├──────────────────────────────┤                      │
│  RSI 차트                    │                      │
├──────────────────────────────┤                      │
│  MACD 차트                   │                      │
├──────────────────┬───────────┴──────────────────────┤
│  시장지표         │  뉴스                            │
└──────────────────┴──────────────────────────────────┘
```

---

## 프로젝트 구조

```
src/
├── api/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── SignUp.tsx
│   │   └── ForgotPasswordModal.tsx
│   ├── chart/
│   │   ├── PriceChart.tsx
│   │   ├── RSIChart.tsx
│   │   ├── MACDChart.tsx
│   │   └── ChartControls.tsx
│   ├── layout/
│   │   └── Header.tsx
│   ├── market-indicator/
│   │   └── MarketIndicatorList.tsx
│   ├── news/
│   │   └── NewsList.tsx
│   ├── stock/
│   │   ├── AIStockList.tsx
│   │   ├── StockCard.tsx
│   │   └── WinrateTest.tsx
│   └── trade-history/
│       └── TradeHistoryPanel.tsx
├── pages/
│   ├── MainPage.tsx
│   └── LoginPage.tsx
├── stores/
│   ├── useAuthStore.ts
│   ├── useModalStore.ts
│   └── useStockStore.ts
├── types/
│   └── stock.ts
└── utils/
    └── cookie.ts
```

---

## 예정 기능

- AI 모델 실적 정보
  - 승률 / 수익률 / 거래횟수 상단 요약
  - AI 매매기록 상세보기
  - AI 보유 종목 현황
  - 매수 가격 / 수량 / 현재 잔액
