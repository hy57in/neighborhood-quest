import { NeighborhoodData, LiquidityMetrics, SensoryPriorityId, SensoryMetric } from '../types/index.ts';

export const SENSORY_PRIORITY_OPTIONS: {
  id: SensoryPriorityId;
  icon: string;
  labelKo: string;
  labelEn: string;
  descKo: string;
  descEn: string;
}[] = [
  {
    id: 'sunset_lighting',
    icon: '🌅',
    labelKo: '따뜻한 골목 노을·조도',
    labelEn: 'Warm Sunset & Alley Lighting',
    descKo: '저녁 퇴근길 주황빛 가로등과 아늑한 분위기',
    descEn: 'Warm golden-hour glow and evening streetlight comfort',
  },
  {
    id: 'park_forest',
    icon: '🌳',
    labelKo: '숲세권·공원 산책로',
    labelEn: 'Forest & Park Trail Access',
    descKo: '집 앞 공원·산책로·나무 그늘과 새소리',
    descEn: 'Immediate access to lush park trails and greenery',
  },
  {
    id: 'quiet_night',
    icon: '🤫',
    labelKo: '밤 시간 고요함·저소음',
    labelEn: 'Quiet Night & Low Noise',
    descKo: '대로변 소음 없이 창문 열어두기 좋은 정온함',
    descEn: 'Calm residential acoustics insulated from road traffic',
  },
  {
    id: 'cafe_alley',
    icon: '☕',
    labelKo: '베이커리·붉은벽돌 카페 골목',
    labelEn: 'Roastery & Brick Cafe Alley',
    descKo: '주말에 걸어서 브런치·커피 마시기 좋은 감성 상권',
    descEn: 'Walkable neighborhood cafes and weekend brunch spots',
  },
  {
    id: 'open_view',
    icon: '🌊',
    labelKo: '탁 트인 한강·호수·조망감',
    labelEn: 'Open River/Lake & Skyline View',
    descKo: '답답하지 않은 동간거리와 수변/전망 개방감',
    descEn: 'Wide building spacing with waterfront or hilltop vistas',
  },
  {
    id: 'safe_walkway',
    icon: '🛡️',
    labelKo: '차 없는 단지·안전한 보행로',
    labelEn: 'Car-Free & Safe Pedestrian Path',
    descKo: '지상 차 없는 공원형 단지와 밝고 안전한 귀갓길',
    descEn: 'Pedestrian-only complex walkways and safe night paths',
  },
];

export const LIQUIDITY_PILLAR_META: {
  key: keyof Omit<LiquidityMetrics, 'totalScore' | 'grade'>;
  order: number;
  step: number;
  icon: string;
  labelKo: string;
  labelEn: string;
  descKo: string;
  descEn: string;
}[] = [
  {
    key: 'brand',
    order: 1,
    step: 1,
    icon: '🏢',
    labelKo: '1. 브랜드',
    labelEn: '1. Brand',
    descKo: '1군 건설사 대장 브랜드·문주 상징성',
    descEn: 'Tier-1 builder brand & gatehouse',
  },
  {
    key: 'newBuild',
    order: 2,
    step: 2,
    icon: '✨',
    labelKo: '2. 신축',
    labelEn: '2. New Build',
    descKo: '연식·커튼월 외관·지하주차장·커뮤니티',
    descEn: 'Modern facade, underground parking & community',
  },
  {
    key: 'subway',
    order: 3,
    step: 3,
    icon: '🚇',
    labelKo: '3. 역세권',
    labelEn: '3. Subway',
    descKo: '지하철역 도보 시간 및 주요 업무지구 직결성',
    descEn: 'Walk time to subway & CBD transit',
  },
  {
    key: 'school',
    order: 4,
    step: 4,
    icon: '🎒',
    labelKo: '4. 학군',
    labelEn: '4. School',
    descKo: '초품아(초등학교 품은 아파트) 및 학원가',
    descEn: 'On-site elementary school & academy access',
  },
  {
    key: 'flatness',
    order: 5,
    step: 5,
    icon: '👟',
    labelKo: '5. 평지',
    labelEn: '5. Flat Terrain',
    descKo: '역~단지 보행 경사도 및 유모차·보행 편의',
    descEn: 'Flat walkable terrain from station to complex',
  },
  {
    key: 'households',
    order: 6,
    step: 6,
    icon: '🏘️',
    labelKo: '6. 세대수',
    labelEn: '6. Households',
    descKo: '1,000세대 이상 대단지 거래량·환금성',
    descEn: '1,000+ households scale & high liquidity',
  },
];

export function buildSensoryMetrics(
  inclinePercent: number,
  cozinessPercent: number,
  noiseDb: number,
  greenWalkMinutes: number
): SensoryMetric[] {
  return [
    {
      type: 'incline',
      title: '체감 경사도',
      icon: 'trending_up',
      value: `${inclinePercent}%`,
      numericValue: inclinePercent,
      status: inclinePercent >= 65 ? '가파름' : inclinePercent >= 30 ? '완경사' : '평지',
      subtext:
        inclinePercent >= 65
          ? '오르막 계단·언덕 체감 높음'
          : inclinePercent >= 30
            ? '완만한 경사 + 엘리베이터 보완'
            : '유모차·자전거 편한 평지',
      colorClass: 'text-[#e03e52]',
    },
    {
      type: 'coziness',
      title: '골목 아늑함',
      icon: 'wb_twilight',
      value: `${cozinessPercent}%`,
      numericValue: cozinessPercent,
      status: cozinessPercent >= 88 ? '매우 따뜻' : '양호',
      subtext: '저녁 가로등 조도 및 보행 심리 안정감',
      colorClass: 'text-[#f59f00]',
    },
    {
      type: 'noise',
      title: '생활 소음',
      icon: 'volume_down',
      value: `${noiseDb}dB`,
      numericValue: noiseDb,
      status: noiseDb <= 35 ? '고요함' : noiseDb <= 48 ? '보통' : '활기참',
      subtext: noiseDb <= 35 ? '도서관 수준의 정온한 주거지' : '생활 상권 백색소음 공존',
      colorClass: 'text-[#3182f6]',
    },
    {
      type: 'greenery',
      title: '숲·공원 접근성',
      icon: 'park',
      value: `${greenWalkMinutes}분`,
      numericValue: greenWalkMinutes,
      status: greenWalkMinutes <= 3 ? '숲세권' : '도보권',
      subtext: `가장 가까운 공원·산책로까지 도보 ${greenWalkMinutes}분`,
      colorClass: 'text-[#0ca678]',
    },
  ];
}

/**
 * Generates a rich, layered architectural & landscape scene SVG data URL
 * so that both the 2D thumbnail and the Image-to-3D relief engine have
 * clear horizon, building silhouettes, windows, road, and foliage depth.
 */
export function createDetailedSceneDataUrl(opts: {
  skyTop: string;
  skyBottom: string;
  sunColor: string;
  hillColor: string;
  roadColor: string;
  bldg1Color: string;
  bldg2Color: string;
  cafeColor: string;
  treeColor: string;
  waterColor?: string;
  slopeDeg: number;
  label: string;
}): string {
  const slopeOffset = Math.round(opts.slopeDeg * 2.4);
  const waterBlock = opts.waterColor
    ? `<rect x="0" y="252" width="480" height="68" fill="${opts.waterColor}" opacity="0.9" />
       <path d="M 20 268 Q 120 262 220 268 T 440 268" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.45" />`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${opts.skyTop}" />
        <stop offset="100%" stop-color="${opts.skyBottom}" />
      </linearGradient>
    </defs>
    <rect width="480" height="320" fill="url(#sky)" />
    <circle cx="370" cy="72" r="38" fill="${opts.sunColor}" opacity="0.88" />
    <!-- Distant Mountain / Horizon -->
    <path d="M0 210 Q140 ${160 - slopeOffset} 310 ${145 - slopeOffset} L480 ${125 - slopeOffset} L480 320 L0 320 Z" fill="${opts.hillColor}" opacity="0.45" />
    <path d="M0 245 Q200 ${210 - slopeOffset} 480 ${175 - slopeOffset} L480 320 L0 320 Z" fill="${opts.hillColor}" />
    <!-- Apartment Tower 1 -->
    <rect x="64" y="${96 - Math.round(slopeOffset * 0.4)}" width="74" height="145" rx="4" fill="${opts.bldg1Color}" stroke="#334155" stroke-width="2" />
    <rect x="76" y="${110 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#fde047" />
    <rect x="104" y="${110 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#fef08a" />
    <rect x="76" y="${134 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#fde047" />
    <rect x="104" y="${134 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#38bdf8" />
    <rect x="76" y="${158 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#fde047" />
    <rect x="104" y="${158 - Math.round(slopeOffset * 0.4)}" width="16" height="14" rx="2" fill="#fde047" />
    <!-- Apartment Tower 2 -->
    <rect x="158" y="${78 - Math.round(slopeOffset * 0.6)}" width="84" height="162" rx="4" fill="${opts.bldg2Color}" stroke="#334155" stroke-width="2" />
    <rect x="172" y="${94 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#fde047" />
    <rect x="204" y="${94 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#fde047" />
    <rect x="172" y="${120 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#fef08a" />
    <rect x="204" y="${120 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#38bdf8" />
    <rect x="172" y="${146 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#fde047" />
    <rect x="204" y="${146 - Math.round(slopeOffset * 0.6)}" width="18" height="15" rx="2" fill="#fde047" />
    <!-- Cafe / Low-rise Building -->
    <rect x="268" y="${154 - Math.round(slopeOffset * 0.7)}" width="78" height="82" rx="5" fill="${opts.cafeColor}" stroke="#475569" stroke-width="2" />
    <rect x="264" y="${182 - Math.round(slopeOffset * 0.7)}" width="86" height="12" rx="3" fill="#e11d48" />
    <rect x="282" y="${198 - Math.round(slopeOffset * 0.7)}" width="50" height="28" rx="3" fill="#fef3c7" />
    <!-- Park Trees -->
    <circle cx="382" cy="${170 - slopeOffset}" r="34" fill="${opts.treeColor}" />
    <circle cx="422" cy="${182 - slopeOffset}" r="28" fill="${opts.treeColor}" opacity="0.9" />
    <circle cx="38" cy="195" r="26" fill="${opts.treeColor}" />
    <!-- Sloped Road -->
    <path d="M0 285 L480 ${245 - slopeOffset} L480 320 L0 320 Z" fill="${opts.roadColor}" />
    ${waterBlock}
    <rect x="14" y="274" width="240" height="32" rx="8" fill="rgba(15,23,42,0.75)" />
    <text x="26" y="295" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">${opts.label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildLiquidityMetrics(params: {
  brandScore: number;
  brandLabel: string;
  brandDetail: string;
  newBuildScore: number;
  newBuildLabel: string;
  newBuildDetail: string;
  subwayScore: number;
  subwayLabel: string;
  subwayDetail: string;
  schoolScore: number;
  schoolLabel: string;
  schoolDetail: string;
  flatnessScore: number;
  flatnessLabel: string;
  flatnessDetail: string;
  householdsScore: number;
  householdsLabel: string;
  householdsDetail: string;
}): LiquidityMetrics {
  const totalScore = Math.round(
    (params.brandScore +
      params.newBuildScore +
      params.subwayScore +
      params.schoolScore +
      params.flatnessScore +
      params.householdsScore) /
      6
  );
  const grade: LiquidityMetrics['grade'] =
    totalScore >= 88
      ? 'S'
      : totalScore >= 80
        ? 'A+'
        : totalScore >= 72
          ? 'A'
          : totalScore >= 64
            ? 'B+'
            : 'B';

  return {
    brand: { score: params.brandScore, label: params.brandLabel, detail: params.brandDetail },
    newBuild: { score: params.newBuildScore, label: params.newBuildLabel, detail: params.newBuildDetail },
    subway: { score: params.subwayScore, label: params.subwayLabel, detail: params.subwayDetail },
    school: { score: params.schoolScore, label: params.schoolLabel, detail: params.schoolDetail },
    flatness: { score: params.flatnessScore, label: params.flatnessLabel, detail: params.flatnessDetail },
    households: { score: params.householdsScore, label: params.householdsLabel, detail: params.householdsDetail },
    totalScore,
    grade,
  };
}

export const INITIAL_NEIGHBORHOODS: NeighborhoodData[] = [
  {
    id: 'mapo-raemian-prugio',
    name: '아현 마포래미안푸르지오',
    nameEn: 'Mapo Raemian Prugio (Ahyeon)',
    subName: '3,885세대 1군 브랜드 · 아현역/애오개역 역세권',
    subNameEn: '3,885 Households Tier-1 Brand · Dual Subway Station',
    stationDistance: '아현역(2호선)·애오개역(5호선) 도보 5분',
    stationDistanceEn: '5 min walk to Ahyeon (Line 2) & Aeogae (Line 5)',
    timeContext: '골든아워',
    timeContextEn: 'Golden Hour',
    quote:
      '“3,885세대 초대형 1군 대단지에 2호선·5호선 더블 역세권(도보 5분), 아현초·한성중고 학군까지! 단지 엘리베이터로 경사도 해결돼서 출퇴근과 환금성(S등급) 모두 최고예요.”',
    quoteEn:
      '“3,885 households Tier-1 brand, 5-min walk to Line 2 & Line 5, elementary & middle schools right next door, and outdoor elevators solving the slope—top tier for both commute and liquidity!”',
    quoteAuthor: '핑구',
    perspectiveQuotes: {
      pingu: {
        author: '핑구 (출퇴근·현실 중심)',
        authorEn: 'Pingu (Commute & Practical)',
        quote:
          '“3,885세대 초대형 1군 대단지에 2·5호선 도보 5분 더블 역세권! 광화문·여의도 출퇴근이 압도적으로 편하고 대단지 거래량이 많아 환금성 1순위예요.”',
        quoteEn:
          '“3,885-unit Tier-1 complex just 5 mins from Line 2 & 5! Effortless commute to Gwanghwamun/Yeouido and unbeaten resale liquidity.”',
      },
      gyodong: {
        author: '교동 (감성·산책 중심)',
        authorEn: 'Gyodong (Vibe & Walk)',
        quote:
          '“차 없는 단지 안 왕벚나무 산책로를 걸으면 수목원에 온 기분이에요. 저녁 노을빛 아래 조용한 보행로(31dB)를 산책하는 시간이 참 따뜻해요.”',
        quoteEn:
          '“Walking along the car-free cherry blossom trails inside feels like a botanical garden. Quiet evening strolls (31dB) under warm sunset lights.”',
      },
    },
    dioramaImageUrl: createDetailedSceneDataUrl({
      skyTop: '#fde68a',
      skyBottom: '#fca5a5',
      sunColor: '#f59e0b',
      hillColor: '#10b981',
      roadColor: '#475569',
      bldg1Color: '#f8fafc',
      bldg2Color: '#e2e8f0',
      cafeColor: '#d97757',
      treeColor: '#059669',
      slopeDeg: 8,
      label: '마포래미안푸르지오 3,885세대 대단지',
    }),
    inclineAngleDeg: 8,
    inclinePercent: 38,
    cozinessPercent: 94,
    noiseDb: 31,
    greenWalkMinutes: 2,
    tags: ['#3885세대대단지', '#1군브랜드', '#2호선5호선역세권', '#초품아학군'],
    tagsEn: ['#3885Households', '#Tier1Brand', '#DualSubway', '#SchoolDistrict'],
    coordinates: { lat: 37.5548, lng: 126.9539 },
    perspective: 'pingu',
    sensoryPriorities: ['park_forest', 'sunset_lighting', 'safe_walkway'],
    liquidity: buildLiquidityMetrics({
      brandScore: 96,
      brandLabel: '래미안·푸르지오 (1군 컨소시엄)',
      brandDetail: '마포 대장 1군 브랜드 프리미엄',
      newBuildScore: 78,
      newBuildLabel: '준신축 (2014년식)',
      newBuildDetail: '커뮤니티·조경 최상급 유지관리',
      subwayScore: 94,
      subwayLabel: '2·5호선 더블 역세권 (도보 5분)',
      subwayDetail: '광화문·여의도·강남 직주근접 최상',
      schoolScore: 92,
      schoolLabel: '아현초·한성중고 인접',
      schoolDetail: '단지 인접 초품아 및 마포 학원가',
      flatnessScore: 76,
      flatnessLabel: '완경사 + 단지 엘리베이터',
      flatnessDetail: '구역별 수직 엘리베이터 완비',
      householdsScore: 99,
      householdsLabel: '3,885세대 매머드급 대단지',
      householdsDetail: '압도적 거래량 및 환금성 S등급',
    }),
    memoryLayers: {
      physical: ['3,885세대 4개 단지 매머드급 규모', '2호선 아현역·5호선 애오개역 도보 5분', '완경사 8° + 단지 내 엘리베이터'],
      sensory: ['차 없는 단지 내 산책로와 왕벚나무 숲길', '저녁 주황빛 단지 가로등 조도 (31dB 저소음)'],
      emotional: ['아늑함 94% · 실거주 만족도와 환금성을 모두 잡은 대단지'],
    },
    metrics: buildSensoryMetrics(38, 94, 31, 2),
    audioMemo: {
      id: 'memo-maraepu',
      title: '음성 메모 · 마래푸 중앙광장에서',
      durationSeconds: 22,
      durationStr: '0:22',
      quote: '“단지 안에 들어오니까 차 소리가 아예 안 들리고 완전히 공원 같아. 세대수가 많아서 상가도 엄청 크네!”',
      recordedAt: '18:10 녹음',
    },
    photos: [
      {
        id: 'photo-mrp-1',
        url: createDetailedSceneDataUrl({
          skyTop: '#fde68a',
          skyBottom: '#f43f5e',
          sunColor: '#fbbf24',
          hillColor: '#059669',
          roadColor: '#334155',
          bldg1Color: '#f8fafc',
          bldg2Color: '#f1f5f9',
          cafeColor: '#d97757',
          treeColor: '#10b981',
          slopeDeg: 8,
          label: '마래푸 중앙 왕벚나무 산책로',
        }),
        alt: '마포래미안푸르지오 단지 전경',
        caption: '3,885세대 대단지 중앙 산책로와 1군 브랜드 문주',
        timeTaken: '18:05 촬영',
      },
    ],
  },
  {
    id: 'seongsu-seoul-forest',
    name: '성수 서울숲 벨라듀 & 연무장길',
    nameEn: 'Seongsu Seoul Forest & Yeonmujang-gil',
    subName: '서울숲·한강 인접 · 완전 평지 · 붉은 벽돌 카페거리',
    subNameEn: 'Near Seoul Forest & Han River · Flat Terrain · Brick Cafe Street',
    stationDistance: '서울숲역(수인분당)·뚝섬역(2호선) 도보 4분',
    stationDistanceEn: '4 min walk to Seoul Forest Stn & Ttukseom Stn',
    timeContext: '청량한 오후',
    timeContextEn: 'Crisp Afternoon',
    quote:
      '“서울숲 대공원 플라타너스 그늘과 붉은 벽돌 로스터리 골목이 집 앞 정원처럼 이어져서, 주말마다 커피 한 잔 들고 산책하기 정말 설레는 동네예요.”',
    quoteEn:
      '“Seoul Forest Park and red-brick roastery cafes connect right outside like a front garden—perfect for inspiring weekend coffee strolls.”',
    quoteAuthor: '교동',
    perspectiveQuotes: {
      pingu: {
        author: '핑구 (출퇴근·현실 중심)',
        authorEn: 'Pingu (Commute & Practical)',
        quote:
          '“2호선 뚝섬역·수인분당선 서울숲역 도보 4분 초역세권에 경사 2° 완전 평지! 강남·도심 출퇴근이 빠르고 하이엔드 신축 수요가 탄탄해요.”',
        quoteEn:
          '“4-min walk to Line 2 & Suin-Bundang Line on 2° flat ground! Fast Gangnam commute and rock-solid high-end demand.”',
      },
      gyodong: {
        author: '교동 (감성·산책 중심)',
        authorEn: 'Gyodong (Vibe & Walk)',
        quote:
          '“서울숲 플라타너스 숲길과 붉은 벽돌 로스터리 커피 향이 어우러져서, 퇴근 후 저녁 산책만으로도 마음이 리프레시되는 감성 동네예요.”',
        quoteEn:
          '“Platanus tree trails in Seoul Forest and warm red-brick roastery aroma make every evening walk feel restorative.”',
      },
    },
    dioramaImageUrl: createDetailedSceneDataUrl({
      skyTop: '#bae6fd',
      skyBottom: '#fef08a',
      sunColor: '#facc15',
      hillColor: '#34d399',
      roadColor: '#475569',
      bldg1Color: '#e0f2fe',
      bldg2Color: '#f8fafc',
      cafeColor: '#c2410c',
      treeColor: '#10b981',
      waterColor: '#38bdf8',
      slopeDeg: 2,
      label: '성수 서울숲 평지 & 붉은벽돌 거리',
    }),
    inclineAngleDeg: 2,
    inclinePercent: 10,
    cozinessPercent: 93,
    noiseDb: 44,
    greenWalkMinutes: 2,
    tags: ['#완전평지', '#서울숲초역세권', '#하이엔드신축', '#붉은벽돌카페'],
    tagsEn: ['#FlatTerrain', '#SeoulForestStn', '#HighEndNewBuild', '#BrickCafeAlley'],
    coordinates: { lat: 37.5446, lng: 127.0443 },
    perspective: 'gyodong',
    sensoryPriorities: ['cafe_alley', 'park_forest', 'open_view'],
    liquidity: buildLiquidityMetrics({
      brandScore: 95,
      brandLabel: '아크로·갤러리아 하이엔드권',
      brandDetail: '성수 전략정비·하이엔드 1군 밀집',
      newBuildScore: 94,
      newBuildLabel: '신축 커튼월룩',
      newBuildDetail: '최신 유리 커튼월 파사드 및 스마트홈',
      subwayScore: 96,
      subwayLabel: '뚝섬역·서울숲역 도보 4분',
      subwayDetail: '2호선·수인분당선 초역세권',
      schoolScore: 80,
      schoolLabel: '경일초·성수중고 도보권',
      schoolDetail: '평지 안전한 통학로 확보',
      flatnessScore: 98,
      flatnessLabel: '경사 2° 완전 평지',
      flatnessDetail: '유모차·자전거 보행 최상급 평지',
      householdsScore: 84,
      householdsLabel: '1,200세대급 주거벨트',
      householdsDetail: '높은 희소성 및 탄탄한 수요',
    }),
    memoryLayers: {
      physical: ['경사 2° 완전 평지 지형', '서울숲역·뚝섬역 도보 4분', '서울숲 대공원 및 한강변 산책로 직결'],
      sensory: ['붉은 벽돌 로스터리 커피 향과 활기찬 골목 (44dB)', '서울숲 플라타너스 나무 그늘'],
      emotional: ['아늑함 93% · 트렌디한 라이프스타일과 숲세권 여유가 공존'],
    },
    metrics: buildSensoryMetrics(10, 93, 44, 2),
    audioMemo: {
      id: 'memo-seongsu',
      title: '음성 메모 · 서울숲 산책로 입구에서',
      durationSeconds: 19,
      durationStr: '0:19',
      quote: '“오르막이 하나도 없는 완전 평지네! 서울숲 나무도 울창하고 카페 골목 분위기가 진짜 최고다.”',
      recordedAt: '16:30 녹음',
    },
    photos: [
      {
        id: 'photo-ss-1',
        url: createDetailedSceneDataUrl({
          skyTop: '#bae6fd',
          skyBottom: '#fde68a',
          sunColor: '#f59e0b',
          hillColor: '#10b981',
          roadColor: '#475569',
          bldg1Color: '#e0f2fe',
          bldg2Color: '#f8fafc',
          cafeColor: '#b45309',
          treeColor: '#059669',
          waterColor: '#38bdf8',
          slopeDeg: 2,
          label: '성수 서울숲 & 붉은벽돌 카페거리',
        }),
        alt: '성수 서울숲 거리',
        caption: '완전 평지 보행로와 붉은 벽돌 카페, 서울숲 녹지',
        timeTaken: '16:25 촬영',
      },
    ],
  },
  {
    id: 'jamsil-els-ricenz',
    name: '송파 잠실 엘스·리센츠 & 석촌호수',
    nameEn: 'Jamsil Els · Ricenz & Seokchon Lake',
    subName: '5,678세대 초대형 대단지 · 초품아 학군 · 완전 평지',
    subNameEn: '5,678 Households Mega Complex · Top School District · Flat',
    stationDistance: '잠실새내역·종합운동장역(2·9호선) 도보 3분',
    stationDistanceEn: '3 min walk to Jamsil Saenae & Sports Complex Stn (Line 2/9)',
    timeContext: '골든아워',
    timeContextEn: 'Golden Hour',
    quote:
      '“5,678세대 완전 평지 대단지에 2·9호선 도보 3분 초역세권, 단지 내 초·중·고까지! 환금성 6대 기준 만점에 가까운 송파 대장 입지예요.”',
    quoteEn:
      '“5,678-unit flat mega-complex, 3-min walk to Lines 2 & 9, and schools inside the complex—near-perfect scores across all 6 liquidity pillars.”',
    quoteAuthor: '핑구',
    perspectiveQuotes: {
      pingu: {
        author: '핑구 (출퇴근·현실 중심)',
        authorEn: 'Pingu (Commute & Practical)',
        quote:
          '“2호선·9호선 급행 도보 3분에 경사 1° 완전 평지, 5,678세대에 초·중·고 초품아까지! 출퇴근·학군·환금성 6대 지표 모두 만점급이에요.”',
        quoteEn:
          '“3-min walk to Line 2 & 9 Express, 1° flat terrain, 5,678 units, and in-complex schools—a 10/10 across commute, schools, and liquidity.”',
      },
      gyodong: {
        author: '교동 (감성·산책 중심)',
        authorEn: 'Gyodong (Vibe & Walk)',
        quote:
          '“단지 안 숲길이 끝없이 이어지고 조금만 걸으면 석촌호수 벚꽃길과 한강공원이 나와서 사계절 산책이 영화 같은 곳이에요.”',
        quoteEn:
          '“Endless green walkways inside the complex lead straight to Seokchon Lake cherry blossoms and Han River Park.”',
      },
    },
    dioramaImageUrl: createDetailedSceneDataUrl({
      skyTop: '#c7d2fe',
      skyBottom: '#fbcfe8',
      sunColor: '#fbbf24',
      hillColor: '#34d399',
      roadColor: '#475569',
      bldg1Color: '#f8fafc',
      bldg2Color: '#f1f5f9',
      cafeColor: '#f472b6',
      treeColor: '#f9a8d4',
      waterColor: '#38bdf8',
      slopeDeg: 1,
      label: '잠실 엘스·리센츠 평지 대단지 & 호수',
    }),
    inclineAngleDeg: 1,
    inclinePercent: 5,
    cozinessPercent: 95,
    noiseDb: 29,
    greenWalkMinutes: 3,
    tags: ['#5678세대대단지', '#초품아명문학군', '#2호선9호선초역세권', '#완전평지'],
    tagsEn: ['#5678Households', '#TopSchoolDistrict', '#Line2Line9Subway', '#100PercentFlat'],
    coordinates: { lat: 37.5131, lng: 127.0842 },
    perspective: 'pingu',
    sensoryPriorities: ['safe_walkway', 'park_forest', 'open_view'],
    liquidity: buildLiquidityMetrics({
      brandScore: 96,
      brandLabel: '1군 메이저 컨소시엄',
      brandDetail: '송파 잠실 대표 랜드마크 대단지',
      newBuildScore: 76,
      newBuildLabel: '정비 완료 준신축급 관리',
      newBuildDetail: '넓은 동간거리 및 단지 조경 리뉴얼',
      subwayScore: 99,
      subwayLabel: '2·9호선 초역세권 (도보 3분)',
      subwayDetail: '단지 출구와 지하철역 바로 연결',
      schoolScore: 99,
      schoolLabel: '초·중·고 단지 내 품은 학군',
      schoolDetail: '잠실초·잠신중고 단지 내부 통학',
      flatnessScore: 100,
      flatnessLabel: '경사 1° 완벽한 평지',
      flatnessDetail: '단지 전체 및 역까지 100% 평지',
      householdsScore: 100,
      householdsLabel: '5,678세대 초대형 메가단지',
      householdsDetail: '대한민국 최고 수준의 환금성',
    }),
    memoryLayers: {
      physical: ['5,678세대 초대형 평지 대단지 (경사 1°)', '2·9호선 도보 3분 초역세권', '단지 내 초·중·고 완벽 배치'],
      sensory: ['석촌호수·한강공원 벚꽃 산책로와 시원한 수변 바람', '단지 내부 조용한 보행 전용 숲길 (29dB)'],
      emotional: ['아늑함 95% · 아이 키우기 좋고 언제든 매매가 쉬운 최상급 환금성 입지'],
    },
    metrics: buildSensoryMetrics(5, 95, 29, 3),
    audioMemo: {
      id: 'memo-jamsil',
      title: '음성 메모 · 잠실 단지 내 학교 앞에서',
      durationSeconds: 20,
      durationStr: '0:20',
      quote: '“단지 안에 초등학교, 중학교, 고등학교가 다 있고 길이 완전 평지라 진짜 살기 편하겠다!”',
      recordedAt: '17:45 녹음',
    },
    photos: [
      {
        id: 'photo-js-1',
        url: createDetailedSceneDataUrl({
          skyTop: '#c7d2fe',
          skyBottom: '#fbcfe8',
          sunColor: '#fbbf24',
          hillColor: '#34d399',
          roadColor: '#475569',
          bldg1Color: '#f8fafc',
          bldg2Color: '#f1f5f9',
          cafeColor: '#f472b6',
          treeColor: '#f9a8d4',
          waterColor: '#38bdf8',
          slopeDeg: 1,
          label: '잠실 평지 메가단지 & 수변 벚꽃길',
        }),
        alt: '잠실 엘스 리센츠 단지',
        caption: '완전 평지 5,678세대 대단지와 수변 벚꽃 산책로',
        timeTaken: '17:40 촬영',
      },
    ],
  },
  {
    id: 'oksu-park-hills',
    name: '옥수 파크힐스 & 달맞이봉 한강뷰',
    nameEn: 'Oksu Park Hills & Maebongsan Han River View',
    subName: '1,976세대 1군 브랜드 · 옥수역 역세권 · 한강 조망',
    subNameEn: '1,976 Households Tier-1 Brand · Oksu Stn · Han River View',
    stationDistance: '옥수역(3호선·경의중앙) 도보 7분',
    stationDistanceEn: '7 min walk to Oksu Stn (Line 3)',
    timeContext: '블루아워',
    timeContextEn: 'Blue Hour',
    quote:
      '“달맞이봉 공원에서 불어오는 선선한 강바람과 보랏빛 블루아워 한강 노을이 매일 저녁 작품을 만들어주는 감성 가득한 동네예요.”',
    quoteEn:
      '“Cool river breezes from Dalbongi Park and purple-gold Han River sunsets turn every evening walk into a painting.”',
    quoteAuthor: '교동',
    perspectiveQuotes: {
      pingu: {
        author: '핑구 (출퇴근·현실 중심)',
        authorEn: 'Pingu (Commute & Practical)',
        quote:
          '“3호선 옥수역에서 압구정까지 딱 1정거장! 1,976세대 현대건설 1군 브랜드 대단지라 강남·도심 출퇴근과 환금성이 모두 확실해요.”',
        quoteEn:
          '“Just 1 stop from Oksu Stn (Line 3) to Apgujeong! 1,976-unit Hyundai Tier-1 complex with fast Gangnam/CBD access and strong liquidity.”',
      },
      gyodong: {
        author: '교동 (감성·산책 중심)',
        authorEn: 'Gyodong (Vibe & Walk)',
        quote:
          '“달맞이봉 공원 산책로와 탁 트인 한강 노을 조망이 동시에 펼쳐져서, 저녁마다 강바람 맞으며 걷기 너무 행복해요.”',
        quoteEn:
          '“Dalbongi Park trails and panoramic Han River sunset views unfold together for unforgettable evening walks.”',
      },
    },
    dioramaImageUrl: createDetailedSceneDataUrl({
      skyTop: '#818cf8',
      skyBottom: '#fda4af',
      sunColor: '#fbbf24',
      hillColor: '#059669',
      roadColor: '#334155',
      bldg1Color: '#f8fafc',
      bldg2Color: '#e2e8f0',
      cafeColor: '#fb923c',
      treeColor: '#10b981',
      waterColor: '#2563eb',
      slopeDeg: 11,
      label: '옥수 파크힐스 & 달맞이봉 한강뷰',
    }),
    inclineAngleDeg: 11,
    inclinePercent: 52,
    cozinessPercent: 91,
    noiseDb: 33,
    greenWalkMinutes: 3,
    tags: ['#1976세대대단지', '#3호선옥수역', '#한강뷰언덕', '#엘리베이터연결'],
    tagsEn: ['#1976Households', '#Line3OksuStn', '#HanRiverView', '#PublicElevator'],
    coordinates: { lat: 37.5432, lng: 127.0152 },
    perspective: 'gyodong',
    sensoryPriorities: ['open_view', 'sunset_lighting', 'park_forest'],
    liquidity: buildLiquidityMetrics({
      brandScore: 92,
      brandLabel: '현대건설 1군 (파크힐스)',
      brandDetail: '성동구 옥수동 대표 대장 브랜드',
      newBuildScore: 84,
      newBuildLabel: '준신축 (2016년식)',
      newBuildDetail: '지하주차장 완비 및 깔끔한 외관',
      subwayScore: 91,
      subwayLabel: '3호선·경의중앙선 옥수역',
      subwayDetail: '압구정 1정거장 · 강남/도심 쾌속 진입',
      schoolScore: 82,
      schoolLabel: '옥정초·옥정중 인접',
      schoolDetail: '단지 인근 도보 통학권',
      flatnessScore: 68,
      flatnessLabel: '언덕 지형 (11° + 엘리베이터)',
      flatnessDetail: '단지 내외부 엘리베이터로 경사 극복',
      householdsScore: 93,
      householdsLabel: '1,976세대 대단지',
      householdsDetail: '옥수동 최대 규모 대단지 환금성',
    }),
    memoryLayers: {
      physical: ['1,976세대 25개동 대단지', '3호선 옥수역 도보 7분', '체감 경사 11° (수직 엘리베이터 보정)'],
      sensory: ['한강 저녁 강바람 & 달맞이봉 숲공기', '정돈된 단지 조용함 (33dB)'],
      emotional: ['아늑함 91% · 강남 접근성과 한강 뷰를 동시에 누리는 동네'],
    },
    metrics: buildSensoryMetrics(52, 91, 33, 3),
    audioMemo: {
      id: 'memo-oksu-1',
      title: '음성 메모 · 달맞이봉 전망대에서',
      durationSeconds: 21,
      durationStr: '0:21',
      quote: '“옥수역에서 엘리베이터 타니까 언덕인데도 편하고 위에서 보는 한강 뷰가 진짜 시원하네!”',
      recordedAt: '19:20 녹음',
    },
    photos: [
      {
        id: 'photo-oksu-1',
        url: createDetailedSceneDataUrl({
          skyTop: '#818cf8',
          skyBottom: '#fda4af',
          sunColor: '#fbbf24',
          hillColor: '#059669',
          roadColor: '#334155',
          bldg1Color: '#f8fafc',
          bldg2Color: '#e2e8f0',
          cafeColor: '#fb923c',
          treeColor: '#10b981',
          waterColor: '#2563eb',
          slopeDeg: 11,
          label: '옥수 파크힐스 & 달맞이봉 한강뷰',
        }),
        alt: '옥수동 달맞이봉 한강뷰',
        caption: '수직 엘리베이터 데크와 한강 조망 언덕 단지',
        timeTaken: '19:15 촬영',
      },
    ],
  },
  {
    id: 'seonghyeon-dong',
    name: '봉천 성현동 관악드림타운',
    nameEn: 'Bongcheon Seonghyeon Gwanak Dream Town',
    subName: '3,544세대 대단지 · 까치산공원 숲세권 · 언덕 지형',
    subNameEn: '3,544 Households Complex · Kkachisan Park · Hillside',
    stationDistance: '서울대입구역(2호선)·숭실대입구역(7호선) 도보 14분',
    stationDistanceEn: '14 min walk from SNU Stn (Line 2)',
    timeContext: '골든아워',
    timeContextEn: 'Golden Hour',
    quote:
      '“3,544세대 매머드급 대단지에 구암초·중·고가 바로 붙어 있고 2·7호선으로 강남·여의도 출퇴근이 20분대예요. 다만 18° 오르막이라 마을버스 환승 동선을 꼭 체크해야 해요!”',
    quoteEn:
      '“3,544-unit mega-complex next to schools with 20-min Line 2/7 access to Gangnam/Yeouido—just factor in the 18° hill and shuttle bus transfer!”',
    quoteAuthor: '핑구',
    perspectiveQuotes: {
      pingu: {
        author: '핑구 (출퇴근·현실 중심)',
        authorEn: 'Pingu (Commute & Practical)',
        quote:
          '“3,544세대 대단지라 거래 환금성이 탄탄하고 강남·여의도 출퇴근이 빨라요. 다만 역에서 도보 14분 오르막(18°)이라 출퇴근 마을버스 배차를 고려해야 해요.”',
        quoteEn:
          '“3,544 units ensure steady resale volume and fast Gangnam/Yeouido commutes, though the 14-min 18° uphill walk means using the shuttle bus.”',
      },
      gyodong: {
        author: '교동 (감성·산책 중심)',
        authorEn: 'Gyodong (Vibe & Walk)',
        quote:
          '“언덕 위라 오히려 차 소리가 전혀 안 들리고(28dB), 단지 바로 뒤 까치산 공원 숲길과 주황빛 노을이 하루의 피로를 싹 씻어줘요.”',
        quoteEn:
          '“Perched on the hill, traffic noise vanishes (28dB), and Kkachisan Park trails plus warm sunset skies melt away the day’s stress.”',
      },
    },
    dioramaImageUrl: createDetailedSceneDataUrl({
      skyTop: '#fde68a',
      skyBottom: '#fca5a5',
      sunColor: '#f59e0b',
      hillColor: '#047857',
      roadColor: '#475569',
      bldg1Color: '#fffbeb',
      bldg2Color: '#fef3c7',
      cafeColor: '#d97757',
      treeColor: '#10b981',
      slopeDeg: 18,
      label: '봉천 성현동 3,544세대 언덕 대단지',
    }),
    inclineAngleDeg: 18,
    inclinePercent: 85,
    cozinessPercent: 92,
    noiseDb: 28,
    greenWalkMinutes: 2,
    tags: ['#3544세대대단지', '#가파른언덕', '#노을맛집', '#숲세권조용한밤'],
    tagsEn: ['#3544Households', '#SteepHill', '#SunsetSpot', '#QuietForestPark'],
    coordinates: { lat: 37.4882, lng: 126.9535 },
    perspective: 'pingu',
    sensoryPriorities: ['quiet_night', 'sunset_lighting', 'park_forest'],
    liquidity: buildLiquidityMetrics({
      brandScore: 82,
      brandLabel: '삼성래미안·동아 (대단지)',
      brandDetail: '관악구 대표 실거주 대단지 브랜드',
      newBuildScore: 68,
      newBuildLabel: '2003년식 (리모델링/정비 추진권)',
      newBuildDetail: '용적률 및 대단지 관리 상태 양호',
      subwayScore: 75,
      subwayLabel: '2호선·7호선 마을버스 5분 / 도보 14분',
      subwayDetail: '강남·여의도 출퇴근 20분대',
      schoolScore: 84,
      schoolLabel: '구암초·구암중고 인접',
      schoolDetail: '단지 바로 옆 초·중·고 밀집',
      flatnessScore: 45,
      flatnessLabel: '경사 18° 가파른 오르막',
      flatnessDetail: '도보 시 언덕 및 계단 체감 높음',
      householdsScore: 97,
      householdsLabel: '3,544세대 매머드급 단지',
      householdsDetail: '신혼부부·생애최초 거래 활발',
    }),
    memoryLayers: {
      physical: ['3,544세대 매머드급 단지', '경사각 18° 오르막 및 계단 지형', '까치산공원 산책로 도보 2분'],
      sensory: ['저녁 골목 주황빛 가로등 조도', '대로변 차단 극저소음 (28dB)'],
      emotional: ['아늑함 92% · 하루의 피로가 씻기는 조용한 숲세권 언덕 동네'],
    },
    metrics: buildSensoryMetrics(85, 92, 28, 2),
    audioMemo: {
      id: 'memo-seonghyeon-1',
      title: '음성 메모 · 성현동 언덕 꼭대기에서',
      durationSeconds: 24,
      durationStr: '0:24',
      quote: '“숨은 좀 차지만 위에서 내려다보는 뷰가 진짜 탁 트여있네. 바람 소리밖에 안 들려...”',
      recordedAt: '18:20 녹음',
    },
    photos: [
      {
        id: 'photo-sh-1',
        url: createDetailedSceneDataUrl({
          skyTop: '#fed7aa',
          skyBottom: '#fb7185',
          sunColor: '#f59e0b',
          hillColor: '#047857',
          roadColor: '#334155',
          bldg1Color: '#fffbeb',
          bldg2Color: '#fef3c7',
          cafeColor: '#d97757',
          treeColor: '#10b981',
          slopeDeg: 18,
          label: '성현동 언덕 노을 & 3,544세대 단지',
        }),
        alt: '성현동 언덕 골목의 노을 풍경',
        caption: '해질녘 주황빛 가로등이 켜진 언덕길과 대단지 아파트',
        timeTaken: '18:15 촬영',
      },
    ],
  },
];
