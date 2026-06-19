# RichClub Project

## 소개

RichClub은 AI 기반 주식 매매 보조 시스템입니다.
데이터 분석과 머신러닝 모델을 활용하여 사용자에게 매수, 매도, 관망 신호를 제공하고 보다 합리적인 투자 판단을 돕는 서비스입니다.

---

## 주요 기능

* 주식 데이터 수집 및 MongoDB 저장
* 기술적 지표 기반 데이터 전처리 (RSI, MACD 등)
* 머신러닝 모델을 통한 매수 / 매도 / 관망 예측
* 예측 결과 시각화 및 성능 분석
* 직관적인 UI 기반 투자 정보 제공

---

## 기술 스택

### Frontend

* React (Vite)
* TypeScript
* Tailwind CSS

### Backend

* Java Spring (예정)

### AI / Data

* Python
* XGBoost
* Pandas, NumPy, Scikit-learn

### Database

* MongoDB Atlas

### Deployment

* Vercel

---

## 프로젝트 구조

```bash
RichClub/
├── frontend/        # React + Tailwind 기반 웹 애플리케이션
├── backend/         # Spring 서버 (예정)
├── ai-model/        # 데이터 수집 및 모델 학습 코드
├── data/            # 전처리 및 학습 데이터
└── README.md
```

---

## 실행 방법

### 1. 프론트엔드 실행

```bash
npm install
npm run dev
```

---

### 2. AI 모델 실행

```bash
python train_model.py
python predict.py
```

---

## 머신러닝 모델

* 모델: XGBoost Classifier
* 입력 데이터:

  * RSI (Relative Strength Index)
  * MACD (Moving Average Convergence Divergence)
  * 이동 평균선 (MA)
  * 거래량 (Volume)
* 출력:

  * Buy (매수)
  * Sell (매도)
  * Hold (관망)

---

## 향후 계획

* 실시간 데이터 반영 주기 개선
* 모델 성능 향상 (Feature Engineering 및 튜닝)
* 사용자 맞춤형 투자 전략 추천
* 모의 투자 기능 추가
