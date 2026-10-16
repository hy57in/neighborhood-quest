import React, { createContext, useContext, useState } from 'react';

export type AppLang = 'ko' | 'en';

interface I18nContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (koText: string, enText: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'ko',
  setLang: () => {},
  t: (ko) => ko,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<AppLang>('ko');

  const t = (koText: string, enText: string) => (lang === 'ko' ? koText : enText);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);

// Localized neighborhood descriptions & NPC dialogues for Korean mode
export const SPOT_KO_DESC: Record<string, string> = {
  seongsu:
    '평탄하고 걷기 좋은 붉은 벽돌 카페 거리, 서울숲 산책로, 한강 수변까지 연결되는 성수동 핫플레이스 단지.',
  oksu:
    '3호선·경의중앙선 환승과 한강뷰가 뛰어나지만, 역에서 아파트 단지까지 가파른 언덕과 계단이 있는 지형.',
  yeonnam:
    '경의선숲길(연트럴파크) 산책로와 아기자기한 골목 상권이 매력적인 홍대입구역 인근 인기 주거지.',
  mapo:
    '5호선 마포역 초역세권과 한강공원 접근성을 갖췄으나, 마포대교 대로변 차량 소음이 있는 단지.',
  jamsil:
    '석촌호수 벚꽃 산책로와 2·8호선 잠실역, 완벽한 평지 보행 환경을 갖춘 송파구 대표 대단지.',
};

export const PRESET_KO_TITLE: Record<string, { badge: string; title: string }> = {
  'policy-tight-2026': {
    badge: '📉 현행 규제 (LTV 70% · 스트레스 DSR 2단계)',
    title: '스트레스 DSR 2단계 (+1.2%p 가산금리) 및 DSR 40% 규제',
  },
  'policy-youth-relax': {
    badge: '🏡 청년·신혼 완화 (LTV 80% · DSR 50% + 지원금)',
    title: '생애최초·신혼부부 LTV 80% 완화 및 스트레스 금리 면제 특례',
  },
  'policy-ultra-strict': {
    badge: '🚨 투기과열지구 강화 (LTV 50% · DSR 35%)',
    title: '투기과열지구 LTV 50% 축소 및 스트레스 DSR 3단계 (+1.5%p)',
  },
};

export const NPC_KO_INFO: Record<
  string,
  {
    name: string;
    roleTitle: string;
    questTitle: string;
  }
> = {
  'npc-pingu': {
    name: '핑구 (Pingu)',
    roleTitle: '신혼부부 첫 내집마련',
    questTitle: '퀘스트: 핑구의 신혼집 대출 한도 뚫기',
  },
  'npc-gyodong': {
    name: '교동 (Gyodong)',
    roleTitle: '29세 1인가구 개발자',
    questTitle: '퀘스트: 교동이의 학자금 대출 & DSR 한도 계산',
  },
};
