interface CandleData {
  close: number;
  datetime: string;
  high: number;
  low: number;
  ma5: number;
  ma20: number;
  ma60: number;
  open: number;
  volume: number;
}

// ================= Ichimoku 계산 (미래 날짜 정밀 정렬 버전) =================
export const getIchimokuSeriesData = (data: CandleData[]) => {
  const tenkanData: any[] = [];
  const kijunData: any[] = [];
  const chikouData: any[] = [];
  const spanAData: any[] = [];
  const spanBData: any[] = [];

  // 원본 데이터의 가장 마지막 날짜를 기준으로 삼습니다.
  const lastActualDateStr = data[data.length - 1].datetime.slice(0, 10);

  // 타임스탬프 기반 안전 정렬용 헬퍼 함수
  const sortByTime = (arr: any[]) => {
    return arr.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    });
  };

  for (let i = 0; i < data.length; i++) {
    const time = data[i].datetime.slice(0, 10);

    const slice9 = data.slice(Math.max(0, i - 8), i + 1);
    const slice26 = data.slice(Math.max(0, i - 25), i + 1);
    const slice52 = data.slice(Math.max(0, i - 51), i + 1);

    const high9 = Math.max(...slice9.map(d => d.high));
    const low9 = Math.min(...slice9.map(d => d.low));
    const high26 = Math.max(...slice26.map(d => d.high));
    const low26 = Math.min(...slice26.map(d => d.low));
    const high52 = Math.max(...slice52.map(d => d.high));
    const low52 = Math.min(...slice52.map(d => d.low));

    const tenkan = (high9 + low9) / 2;
    const kijun = (high26 + low26) / 2;
    const spanA = (tenkan + kijun) / 2;
    const spanB = (high52 + low52) / 2;

    // 1. 전환선 / 기준선
    tenkanData.push({ time, value: tenkan });
    kijunData.push({ time, value: kijun });

    // 2. 후행스팬 (오늘 자리에 26일 뒤의 종가를 매핑)
    if (i + 26 < data.length) {
      chikouData.push({ time, value: data[i + 26].close });
    }

    // 3. 선행스팬 1, 2
    let futureTime = "";
    if (i + 26 < data.length) {
      // 차트 내부에 존재하는 날짜 사용
      futureTime = data[i + 26].datetime.slice(0, 10);
    } else {
      // 핵심 교정: 마지막 날짜를 기준으로 '넘어간 데이터 개수(오프셋)'만큼 순차적으로 날짜를 더해줍니다.
      // 곱하기 연산(* 1.4)을 없애고 기준점으로부터 확실하게 우상향하도록 보정합니다.
      const remainingOffset = i + 26 - (data.length - 1);
      const d = new Date(lastActualDateStr);
      d.setDate(d.getDate() + remainingOffset);
      futureTime = d.toISOString().slice(0, 10);
    }

    spanAData.push({ time: futureTime, value: spanA });
    spanBData.push({ time: futureTime, value: spanB });
  }

  // 라이트웨이트 차트 에러를 방지하기 위해 시간 순서대로 완벽히 정렬하여 반환
  return {
    tenkanData: sortByTime(tenkanData),
    kijunData: sortByTime(kijunData),
    chikouData: sortByTime(chikouData),
    spanAData: sortByTime(spanAData),
    spanBData: sortByTime(spanBData),
  };
};
