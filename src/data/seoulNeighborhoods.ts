import type {
  NeighborhoodSpot,
  PhotoInput,
  NeighborhoodMemory,
  NpcResident,
  PolicyDocumentPreset,
  PolicyAnalysisResult,
} from '../types';

export const VILLAGE_NPCS: NpcResident[] = [
  {
    id: 'npc-pingu',
    name: 'Pingu (핑구 · Newlywed)',
    roleTitle: 'Dual-Income Newlywed Penguin',
    avatarEmoji: '🐧',
    shirtColor: '#FF8FA3',
    hatColor: '#FFE5EC',
    x: -0.65,
    z: 0.55,
    annualIncomeMillionKRW: 98, // ₩98M/yr combined
    cashSavingsMillionKRW: 430, // ₩430M saved
    existingAnnualDebtPaymentMillionKRW: 6, // ₩6M/yr
    isFirstTimeBuyer: true,
    questTitle: 'Quest #1: Pingu’s Newlywed Igloo Dream',
    questPrompt:
      'Noot noot! We saved ₩430M and earn ₩98M/year together! Can we pass both the LTV and DSR rules to buy a starter apartment in this neighborhood?',
  },
  {
    id: 'npc-gyodong',
    name: 'Gyodong (교동 · 29yo Solo Dev)',
    roleTitle: 'First-Time Youth Homebuyer',
    avatarEmoji: '🐶',
    shirtColor: '#4EA8DE',
    hatColor: '#FFD166',
    x: 0.75,
    z: 0.65,
    annualIncomeMillionKRW: 64, // ₩64M/yr solo income
    cashSavingsMillionKRW: 320, // ₩320M saved
    existingAnnualDebtPaymentMillionKRW: 8, // ₩8M/yr car/student loan
    isFirstTimeBuyer: true,
    questTitle: 'Quest #2: Gyodong vs. The Stress DSR Trap',
    questPrompt:
      'The headline says 70% LTV is allowed, so I thought I could borrow ₩600M+! Why does the bank say my DSR limit cuts my loan in half?',
  },
];

export const POLICY_PRESETS: PolicyDocumentPreset[] = [
  {
    id: 'policy-balanced',
    title: 'Current Baseline: Metropolitan 70% LTV & 40% DSR Rule',
    badge: '⚖️ Baseline Policy',
    rawPolicyText: `[Ministry of Land & Financial Services Commission — Metropolitan Housing Loan Guideline]
1. First-Time Homebuyer LTV (Loan-to-Value) Limit: Up to 70% of apartment value in Seoul metropolitan areas (60% for standard buyers).
2. DSR (Debt Service Ratio) Ceiling: Total annual debt repayment (principal + interest on 30-year mortgage plus existing debt) must not exceed 40% of annual gross income.
3. Stress DSR Phase 2 Buffer: Base mortgage rate is 3.8% p.a., with a mandatory +0.75%p Stress DSR buffer applied when calculating DSR limits.
4. Youth Transit-Oriented Bonus: ₩40M special housing voucher for first-time buyers near subway hubs.`,
    defaultRules: {
      policyTitleEn: 'Metropolitan 70% LTV & 40% Stress DSR Baseline',
      ltvFirstTimePercent: 70,
      ltvStandardPercent: 60,
      dsrLimitPercent: 40,
      baseInterestRatePercent: 3.8,
      stressDsrBufferPercent: 0.75,
      youthSubsidyMillionKRW: 40,
    },
  },
  {
    id: 'policy-youth-boost',
    title: 'Deregulation: 2030 Youth & Newlywed Housing Boost (80% LTV / 50% DSR)',
    badge: '🌱 Youth Deregulation',
    rawPolicyText: `[정부 청년·신혼부부 내집마련 특별 완화 대책 / Youth & Newlywed Special Deregulation Act]
1. 생애최초 및 청년 주택담보대출 LTV(담보인정비율)를 기존 70%에서 최대 80%로 대폭 상향한다 (First-time buyer LTV raised to 80%).
2. 청년·신혼부부의 소득 대비 총부채원리금상환비율(DSR) 한도를 50%로 완화하고 스트레스 금리 가산(0.0%p)을 면제한다 (DSR cap relaxed to 50%, Stress DSR buffer 0%).
3. 정책 모기지 우대금리 연 3.3% 적용 및 생애최초 구입 지원금 80백만원(₩80M)을 지원한다.`,
    defaultRules: {
      policyTitleEn: 'Youth & Newlywed 80% LTV / 50% DSR Deregulation Act',
      ltvFirstTimePercent: 80,
      ltvStandardPercent: 70,
      dsrLimitPercent: 50,
      baseInterestRatePercent: 3.3,
      stressDsrBufferPercent: 0.0,
      youthSubsidyMillionKRW: 80,
    },
  },
  {
    id: 'policy-tighten',
    title: 'Tightening: Speculation Overheating Zone & Stress DSR Phase 3 (40% LTV / 35% DSR)',
    badge: '🔥 Strict Tightening',
    rawPolicyText: `[가계부채 관리 및 투기과열지구 대출 규제 강화 방안 / Speculation Zone & Stress DSR Phase 3 Tightening]
1. 서울 주요 지역 과열 방지를 위해 주택담보대출 LTV 한도를 생애최초 50%, 일반 40%로 축소한다 (LTV reduced to 50% first-time / 40% standard).
2. 차주 단위 DSR 한도를 35%로 하향 조정하고, 기준금리 4.2%에 스트레스 DSR 3단계 가산금리 +1.5%p를 의무 적용한다 (DSR cap tightened to 35% with +1.5%p stress rate buffer).
3. 한시적 구입 보조금(₩0M)은 종료한다.`,
    defaultRules: {
      policyTitleEn: 'Speculation Zone 50% LTV & 35% Stress DSR Tightening',
      ltvFirstTimePercent: 50,
      ltvStandardPercent: 40,
      dsrLimitPercent: 35,
      baseInterestRatePercent: 4.2,
      stressDsrBufferPercent: 1.5,
      youthSubsidyMillionKRW: 0,
    },
  },
];

export const INITIAL_POLICY_STATE: PolicyAnalysisResult = {
  policyTitleEn: 'Metropolitan 70% LTV & 40% Stress DSR Baseline',
  policySummaryEn:
    'First-time buyers get up to 70% LTV, but 30-year mortgage payments (with +0.75% Stress DSR buffer at 4.55% effective rate) cannot exceed 40% of annual income.',
  extractedRules: {
    ltvFirstTimePercent: 70,
    ltvStandardPercent: 60,
    dsrLimitPercent: 40,
    baseInterestRatePercent: 3.8,
    stressDsrBufferPercent: 0.75,
    effectiveRatePercent: 4.55,
    youthSubsidyMillionKRW: 40,
  },
  npcOutcomes: [
    {
      npcId: 'npc-pingu',
      npcName: 'Pingu (핑구 · Newlywed)',
      targetHomePriceMillionKRW: 920,
      maxLtvLoanMillionKRW: 644,
      maxDsrLoanMillionKRW: 538,
      finalApprovedLoanMillionKRW: 538,
      bindingConstraint: 'DSR',
      totalPurchasingPowerMillionKRW: 1008,
      shortfallMillionKRW: 0,
      canBuyHome: true,
      npcReactionDialogueEn:
        'Noot noot! Even though 40% DSR capped our loan at ₩538M (below the ₩644M LTV limit), our ₩430M savings + ₩40M subsidy reaches ₩1,008M—Pingu can buy the ₩920M home!',
      questResolutionNoteEn: 'Quest Cleared! Pingu qualifies for ₩538M mortgage (DSR-bound) and unlocks the home.',
    },
    {
      npcId: 'npc-gyodong',
      npcName: 'Gyodong (교동 · 29yo Solo Dev)',
      targetHomePriceMillionKRW: 920,
      maxLtvLoanMillionKRW: 644,
      maxDsrLoanMillionKRW: 284,
      finalApprovedLoanMillionKRW: 284,
      bindingConstraint: 'DSR',
      totalPurchasingPowerMillionKRW: 644,
      shortfallMillionKRW: 276,
      canBuyHome: false,
      npcReactionDialogueEn:
        'Woof... Now I see why: 70% LTV allows ₩644M, but my ₩64M solo income + 40% Stress DSR caps my actual loan at just ₩284M. Gyodong is ₩276M short unless policy changes or we pick a lower-priced neighborhood!',
      questResolutionNoteEn: 'Blocked by DSR Cap: Gyodong’s max loan is ₩284M vs ₩644M LTV allowance (Shortfall: ₩276M).',
    },
  ],
  verification: {
    modelUsed: 'gemini-4-argon',
    thinkingLevel: 'high',
    interactionId: 'int_argon_policy_init_01',
    verifierInteractionId: 'int_argon_policy_ver_02',
    fidelityScore: 99,
    patchCount: 2,
    summary:
      'Gemini 4 Argon verified LTV vs. DSR binding constraints and auto-patched 30-year annuity math with the +0.75% Stress DSR buffer.',
    checks: [
      {
        ruleName: 'LTV Cap vs. DSR Binding Constraint Audit',
        status: 'auto_patched',
        initialDraft: 'Naive LTV 70% Loan: ₩644M',
        verifiedRule: 'min(LTV ₩644M, DSR ₩538M) = ₩538M',
        explanation:
          'Corrected naive LTV-only loan assumption: DSR 40% is the true binding constraint for both residents.',
      },
      {
        ruleName: 'Stress DSR Rate Buffer Verification',
        status: 'auto_patched',
        initialDraft: 'Base Rate 3.80%',
        verifiedRule: 'Effective Stress Rate 4.55% (+0.75% buffer)',
        explanation: 'Applied mandatory +0.75% Stress DSR buffer to 30-year mortgage annuity formula.',
      },
      {
        ruleName: 'Existing Annual Debt Deduction',
        status: 'passed',
        initialDraft: 'Gross Income DSR',
        verifiedRule: 'Net DSR after ₩6M–₩8M/yr debt deduction',
        explanation: 'Verified existing debt obligations are subtracted prior to mortgage principal calculation.',
      },
    ],
  },
};

export const SEOUL_NEIGHBORHOODS: NeighborhoodSpot[] = [
  {
    id: 'seongsu-forest',
    name: 'Seongsu-dong (Seoul Forest)',
    nameKo: '성수동 서울숲',
    district: 'Seongdong-gu',
    apartmentName: 'Seoul Forest IPARK Riverforet',
    subwayStation: 'Ttukseom / Seoul Forest Stn.',
    subwayLine: 'Line 2 & Suin-Bundang',
    subwayLineColor: '#3CB371',
    mapX: 64,
    mapY: 48,
    vibeTag: 'Lush Park & Red-Brick Cafes',
    shortDesc: 'Flat walkable streets blending Seoul Forest greenery, Han River breeze, and vibrant roastery cafes.',
    avgPriceTag: 'Starter ₩920M (59㎡)',
    starterHomePriceMillionKRW: 920,
    defaultRatings: {
      hillSteepness: 12,
      parkGreenery: 94,
      subwayWalkMinutes: 5,
      trafficNoise: 58,
      cafeMartConvenience: 95,
    },
    sampleVoiceNoteKo:
      '뚝섬역에서 평지로 5분 거리라 걸어다니기 정말 편해요! 서울숲 산책로가 바로 옆이라 벚꽃과 나무가 울창하고 붉은 벽돌 카페가 많지만, 주말엔 성수동 메인 거리 차소리와 인파 소음이 조금 있어요.',
    sampleVoiceNoteEn:
      'Only a 5-minute flat walk from Ttukseom Station! Seoul Forest trail is right next door with lush cherry blossom trees and cozy red-brick cafes, though the main avenue has noticeable weekend traffic noise.',
    presetPhotos: [
      {
        caption: 'Seoul Forest Cherry Blossom Trail by Complex Gate',
        tag: 'park',
        sceneType: 'park_trail',
      },
      {
        caption: 'Seongsu Red-Brick Roastery Alley & Street Traffic',
        tag: 'street',
        sceneType: 'brick_cafe',
      },
      {
        caption: 'Ttukseom Station (Line 2) 5-Min Flat Walkway',
        tag: 'subway',
        sceneType: 'subway_exit',
      },
    ],
  },
  {
    id: 'oksu-hilltop',
    name: 'Oksu / Hannam Hilltop',
    nameKo: '옥수동 파크힐스',
    district: 'Seongdong-gu',
    apartmentName: 'Oksu Park Hills 108-dong',
    subwayStation: 'Oksu Station',
    subwayLine: 'Line 3 & Gyeongui-Jungang',
    subwayLineColor: '#FF7F32',
    mapX: 54,
    mapY: 53,
    vibeTag: 'Hillside Stairs & River Panorama',
    shortDesc: 'Dramatic hillside elevation with outdoor stairs, direct Line 3 subway access, and serene complex grounds.',
    avgPriceTag: 'Starter ₩890M (59㎡)',
    starterHomePriceMillionKRW: 890,
    defaultRatings: {
      hillSteepness: 84,
      parkGreenery: 68,
      subwayWalkMinutes: 4,
      trafficNoise: 28,
      cafeMartConvenience: 76,
    },
    sampleVoiceNoteKo:
      '옥수역 3호선 출구에서 정말 가깝지만 단지 안으로 올라가는 언덕 경사가 꽤 가파르고 계단이 많아요! 대신 단지 위쪽은 차소리가 전혀 안 들리고 조용하며 한강 조망이 시원하게 트여 있어요.',
    sampleVoiceNoteEn:
      'Right outside Oksu Station Exit 4, but the uphill climb into the apartment complex is quite steep with lots of stairs! Once inside, it is super peaceful with zero traffic noise and sweeping Han River views.',
    presetPhotos: [
      {
        caption: 'Steep Hillside Stairs & Walkway Leading to 108-dong',
        tag: 'hill',
        sceneType: 'hill_alley',
      },
      {
        caption: 'Oksu Station (Line 3) Direct Transfer Entrance',
        tag: 'subway',
        sceneType: 'subway_exit',
      },
      {
        caption: 'Terraced Apartment Towers Overlooking Han River',
        tag: 'apartment',
        sceneType: 'apt_complex',
      },
    ],
  },
  {
    id: 'yeonnam-forest',
    name: 'Yeonnam-dong (Yeontral Park)',
    nameKo: '연남동 경의선숲길',
    district: 'Mapo-gu',
    apartmentName: 'Yeonnam Cozy Terrace & KCC',
    subwayStation: 'Hongik Univ. Station',
    subwayLine: 'Line 2, AREX & Gyeongui',
    subwayLineColor: '#2E8B57',
    mapX: 31,
    mapY: 42,
    vibeTag: 'Linear Forest Trail & Indie Boutiques',
    shortDesc: 'Green railway-turned-park stretching through pastel low-rise villas, bakeries, and triple-line transit.',
    avgPriceTag: 'Starter ₩720M (59㎡)',
    starterHomePriceMillionKRW: 720,
    defaultRatings: {
      hillSteepness: 18,
      parkGreenery: 88,
      subwayWalkMinutes: 7,
      trafficNoise: 48,
      cafeMartConvenience: 92,
    },
    sampleVoiceNoteKo:
      '경의선숲길 공원을 따라 평지로 산책하기 너무 좋고 골목마다 감성 베이커리와 카페가 가득해요. 홍대입구역까지 도보 7분이고 단지 안쪽 골목은 생각보다 아늑해요.',
    sampleVoiceNoteEn:
      'Walking along the Gyeongui Line Forest Park is completely flat and full of ginkgo and cherry trees. 7 minutes on foot to Hongik Univ. Station with charming bakeries everywhere.',
    presetPhotos: [
      {
        caption: 'Gyeongui Line Linear Park Trail & Lawn',
        tag: 'park',
        sceneType: 'park_trail',
      },
      {
        caption: 'Pastel Brick Cafe & Bakery Corner in Yeonnam',
        tag: 'street',
        sceneType: 'brick_cafe',
      },
      {
        caption: 'Hongik Univ. Station Exit 3 Pedestrian Plaza',
        tag: 'subway',
        sceneType: 'subway_exit',
      },
    ],
  },
  {
    id: 'jamsil-lake',
    name: 'Jamsil (Seokchon Lake)',
    nameKo: '잠실 석촌호수',
    district: 'Songpa-gu',
    apartmentName: 'Jamsil Els & Lake Palace',
    subwayStation: 'Jamsil Station',
    subwayLine: 'Line 2 & Line 8',
    subwayLineColor: '#48B574',
    mapX: 76,
    mapY: 64,
    vibeTag: 'Flat Lakefront & Mega Complex',
    shortDesc: 'Wide-open flat boulevards, Seokchon Lake cherry blossom loop, and ultra-convenient family infrastructure.',
    avgPriceTag: 'Starter ₩1,080M (59㎡)',
    starterHomePriceMillionKRW: 1080,
    defaultRatings: {
      hillSteepness: 6,
      parkGreenery: 91,
      subwayWalkMinutes: 6,
      trafficNoise: 44,
      cafeMartConvenience: 96,
    },
    sampleVoiceNoteKo:
      '완전한 평지라 유모차나 자전거 타기에 최고예요! 단지 바로 앞이 석촌호수 산책로라 조경이 훌륭하고 잠실역까지 도보 6분이라 출퇴근과 백화점 마트 이용이 완벽합니다.',
    sampleVoiceNoteEn:
      'Completely flat terrain—ideal for strollers and jogging! Seokchon Lake cherry blossom loop is right across the street, and Jamsil Station is a 6-minute walk with top-tier shopping and schools.',
    presetPhotos: [
      {
        caption: 'Seokchon Lake Waterfront & Cherry Blossom Promenade',
        tag: 'park',
        sceneType: 'lake_view',
      },
      {
        caption: 'Jamsil Els Wide Flat Complex Courtyard',
        tag: 'apartment',
        sceneType: 'apt_complex',
      },
      {
        caption: 'Jamsil Station (Line 2/8) Direct Underground Link',
        tag: 'subway',
        sceneType: 'subway_exit',
      },
    ],
  },
  {
    id: 'mapo-gongdeok',
    name: 'Ahyeon / Gongdeok Hub',
    nameKo: '마포 래미안푸르지오',
    district: 'Mapo-gu',
    apartmentName: 'Mapo Raemian Prugio (Ma-Rae-Pu)',
    subwayStation: 'Aeogae / Gongdeok Stn.',
    subwayLine: 'Line 5, 6, AREX & Gyeongui',
    subwayLineColor: '#9B59B6',
    mapX: 39,
    mapY: 46,
    vibeTag: 'Mega Transit Hub & Terraced Complex',
    shortDesc: 'Iconic 3,885-unit terraced apartment village with quad-line commuter power and lively street dining.',
    avgPriceTag: 'Starter ₩850M (59㎡)',
    starterHomePriceMillionKRW: 850,
    defaultRatings: {
      hillSteepness: 64,
      parkGreenery: 72,
      subwayWalkMinutes: 6,
      trafficNoise: 66,
      cafeMartConvenience: 90,
    },
    sampleVoiceNoteKo:
      '단지 규모가 엄청 크고 조경이 잘 되어 있는데, 1단지에서 4단지로 갈수록 언덕 경사와 엘리베이터/계단 이동이 있어요. 마포대로변 쪽은 출퇴근 시간 차량 소음이 꽤 있는 편입니다.',
    sampleVoiceNoteEn:
      'Massive landscaped complex with fast access to Gongdeok and Aeogae stations, though moving between complex zones involves terraced hills and stairs, plus noticeable traffic noise along Mapo-daero.',
    presetPhotos: [
      {
        caption: 'Terraced Hillside Walkway & Outdoor Elevator in Complex',
        tag: 'hill',
        sceneType: 'hill_alley',
      },
      {
        caption: 'Mapo Raemian Prugio Central Garden & Towers',
        tag: 'apartment',
        sceneType: 'apt_complex',
      },
      {
        caption: 'Aeogae / Gongdeok Station Commuter Exit & Avenue',
        tag: 'subway',
        sceneType: 'subway_exit',
      },
    ],
  },
];

// Synthesize crisp field-visit JPEG data URLs for instant demo & multimodal Gemini 4 Argon analysis
export function generatePresetFieldPhotos(spot: NeighborhoodSpot): PhotoInput[] {
  if (typeof document === 'undefined') return [];

  return spot.presetPhotos.map((preset, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 220);
      if (preset.sceneType === 'hill_alley') {
        skyGrad.addColorStop(0, '#FFD6A5');
        skyGrad.addColorStop(1, '#FFF3E0');
      } else if (preset.sceneType === 'park_trail' || preset.sceneType === 'lake_view') {
        skyGrad.addColorStop(0, '#BDE0FE');
        skyGrad.addColorStop(1, '#E8F8F5');
      } else {
        skyGrad.addColorStop(0, '#C8E7FF');
        skyGrad.addColorStop(1, '#FFF8F0');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 480, 320);

      ctx.fillStyle = '#FFE066';
      ctx.beginPath();
      ctx.arc(400, 62, 28, 0, Math.PI * 2);
      ctx.fill();

      if (preset.sceneType === 'hill_alley') {
        ctx.fillStyle = '#E6CCB2';
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(0, 250);
        ctx.lineTo(480, 125);
        ctx.lineTo(480, 320);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#D4A373';
        for (let s = 0; s < 9; s++) {
          ctx.fillRect(60 + s * 38, 235 - s * 11, 36, 12);
        }
        ctx.strokeStyle = '#6D597A';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(60, 215);
        ctx.lineTo(400, 115);
        ctx.stroke();

        ctx.fillStyle = '#FFF5EB';
        ctx.fillRect(300, 32, 115, 115);
        ctx.fillStyle = '#7CC6A6';
        ctx.fillRect(295, 24, 125, 12);
      } else if (preset.sceneType === 'subway_exit') {
        ctx.fillStyle = '#D8E2DC';
        ctx.fillRect(0, 200, 480, 120);
        ctx.fillStyle = '#3D5A80';
        ctx.fillRect(110, 105, 260, 105);
        ctx.fillStyle = spot.subwayLineColor || '#3CB371';
        ctx.fillRect(110, 92, 260, 22);
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(145, 103, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#293241';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(spot.subwayStation, 165, 108);
      } else if (preset.sceneType === 'park_trail' || preset.sceneType === 'lake_view') {
        ctx.fillStyle = '#95D5B2';
        ctx.fillRect(0, 185, 480, 135);
        if (preset.sceneType === 'lake_view') {
          ctx.fillStyle = '#72EFDD';
          ctx.beginPath();
          ctx.ellipse(240, 265, 210, 48, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FAEDCD';
        ctx.beginPath();
        ctx.moveTo(160, 320);
        ctx.lineTo(220, 185);
        ctx.lineTo(270, 185);
        ctx.lineTo(340, 320);
        ctx.fill();
        const treeX = [75, 155, 335, 415];
        treeX.forEach((tx, ti) => {
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(tx - 7, 145, 14, 52);
          ctx.fillStyle = ti % 2 === 0 ? '#FFB7C5' : '#52B788';
          ctx.beginPath();
          ctx.arc(tx, 125, 38, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (preset.sceneType === 'brick_cafe') {
        ctx.fillStyle = '#CFCFCF';
        ctx.fillRect(0, 215, 480, 105);
        ctx.fillStyle = '#D97B66';
        ctx.fillRect(75, 78, 195, 138);
        ctx.fillStyle = '#5E4B43';
        ctx.fillRect(70, 68, 205, 16);
        ctx.fillStyle = '#FFF3B0';
        ctx.fillRect(95, 150, 155, 18);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(320, 235, 95, 36);
      } else {
        ctx.fillStyle = '#A3E4D7';
        ctx.fillRect(0, 205, 480, 115);
        ctx.fillStyle = '#FFF5EB';
        ctx.fillRect(90, 48, 120, 160);
        ctx.fillRect(255, 64, 120, 145);
        ctx.fillStyle = '#7CC6A6';
        ctx.fillRect(85, 38, 130, 14);
        ctx.fillRect(250, 54, 130, 14);
      }

      ctx.fillStyle = 'rgba(38, 42, 56, 0.78)';
      ctx.fillRect(0, 276, 480, 44);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`📸 ${preset.caption}`, 14, 303);
    }

    return {
      id: `${spot.id}-photo-${idx}`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.86),
      mimeType: 'image/jpeg',
      caption: preset.caption,
      tag: preset.tag,
    };
  });
}

export const INITIAL_SAVED_MEMORIES: NeighborhoodMemory[] = [
  {
    id: 'mem-seongsu-initial',
    createdAt: '2026-10-16T10:15:00.000Z',
    neighborhoodId: 'seongsu-forest',
    neighborhoodName: 'Seongsu-dong (Seoul Forest)',
    neighborhoodNameKo: '성수동 서울숲',
    district: 'Seongdong-gu',
    apartmentName: 'Seoul Forest IPARK Riverforet',
    observation: {
      neighborhoodId: 'seongsu-forest',
      neighborhoodName: 'Seongsu-dong (Seoul Forest)',
      neighborhoodNameKo: '성수동 서울숲',
      district: 'Seongdong-gu',
      apartmentName: 'Seoul Forest IPARK Riverforet',
      subwayStation: 'Ttukseom / Seoul Forest Stn.',
      subwayLine: 'Line 2 & Suin-Bundang',
      subwayLineColor: '#3CB371',
      voiceNoteText:
        'Only a 5-minute flat walk from Ttukseom Station! Seoul Forest trail is right next door with lush cherry blossom trees and cozy red-brick cafes, though the main avenue has noticeable weekend traffic noise.',
      voiceLanguage: 'en-US',
      photos: [],
      quickRatings: {
        hillSteepness: 12,
        parkGreenery: 94,
        subwayWalkMinutes: 5,
        trafficNoise: 58,
        cafeMartConvenience: 95,
      },
    },
    blueprint: {
      worldTitle: 'Seoul Forest Brick & Blossom Island',
      tagline: 'Flat Parkfront Haven with Roastery Alleys',
      englishSummary:
        'A flat, highly walkable 3D miniature of Seongsu-dong featuring dense Seoul Forest cherry blossoms, red-brick cafe terraces, 5-minute Line 2 access, and weekend avenue acoustic waves.',
      originalNotesSummary:
        '5-min flat walk to Ttukseom Stn, lush Seoul Forest park trail, trendy red-brick cafes, moderate weekend street traffic noise.',
      timeOfDay: 'golden_hour',
      islandPalette: {
        grassColor: '#95D5B2',
        earthColor: '#DDA15E',
        roadColor: '#E6CCB2',
        skyAccentColor: '#FFE5D9',
        waterColor: '#72EFDD',
      },
      terrain: {
        slopeDegrees: 3,
        slopeDirection: 'north',
        hasHillsideStairs: false,
        hasRiverOrLake: true,
        waterSide: 'south',
      },
      transit: {
        stationName: 'Ttukseom / Seoul Forest Stn.',
        lineName: 'Line 2 & Suin-Bundang',
        lineColor: '#3CB371',
        walkMinutes: 5,
        x: 2.05,
        z: 1.25,
      },
      traffic: {
        noiseLevel: 58,
        carCount: 4,
        showNoiseWaves: true,
        noiseSourceLabel: 'Seongsu Café Street Traffic',
      },
      livabilityMetrics: {
        walkabilityScore: 95,
        transitScore: 92,
        natureScore: 96,
        quietnessScore: 68,
        convenienceScore: 95,
        overallGrade: 'S',
      },
      homebuyerInsights: {
        pros: [
          '5-min flat walk to Ttukseom & Seoul Forest Stations',
          'Direct access to Seoul Forest cherry blossom trails & Han River',
          'Unbeatable specialty coffee, bakery, and lifestyle infrastructure',
        ],
        watchOuts: [
          'Weekend visitor crowds & street noise (58 dB) near Cafe Street',
          'Premium price per pyeong requires careful budget planning',
        ],
        bestForPersona: 'Dual-income young couples & nature-loving urbanites who value parks and cafes',
        aiVerdict: 'Grade S: One of Seoul’s rarest combinations of flat parkside living and fast Line 2 commuting.',
      },
      buildings: [
        {
          id: 'apt-1',
          kind: 'apartment',
          label: 'IPARK Riverforet 101',
          x: -1.35,
          z: -1.15,
          width: 1.15,
          depth: 0.9,
          floors: 10,
          wallColor: '#FFF5EB',
          roofColor: '#7CC6A6',
          roofStyle: 'flat',
        },
        {
          id: 'apt-2',
          kind: 'apartment',
          label: 'IPARK Riverforet 102',
          x: 0.25,
          z: -1.45,
          width: 1.0,
          depth: 0.85,
          floors: 8,
          wallColor: '#F6E8EA',
          roofColor: '#8FB8DE',
          roofStyle: 'flat',
        },
        {
          id: 'cafe-1',
          kind: 'cafe',
          label: 'Seongsu Brick Roastery',
          x: -1.8,
          z: 1.05,
          width: 0.95,
          depth: 0.8,
          floors: 2,
          wallColor: '#D97B66',
          roofColor: '#5E4B43',
          roofStyle: 'terrace',
        },
        {
          id: 'mart-1',
          kind: 'convenience_store',
          label: 'Policy Bank & Mart',
          x: 1.75,
          z: -0.25,
          width: 0.85,
          depth: 0.75,
          floors: 2,
          wallColor: '#EBF5FF',
          roofColor: '#69A7E8',
          roofStyle: 'flat',
        },
      ],
      trees: [
        { x: -2.55, z: -2.05, kind: 'cherry_blossom', scale: 1.25, foliageColor: '#FFB7C5' },
        { x: -2.35, z: -0.35, kind: 'oak', scale: 1.15, foliageColor: '#76C893' },
        { x: -2.6, z: 1.9, kind: 'cherry_blossom', scale: 1.3, foliageColor: '#FFC6D0' },
        { x: -0.65, z: 0.2, kind: 'ginkgo', scale: 1.0, foliageColor: '#FFD166' },
        { x: 0.85, z: 0.15, kind: 'oak', scale: 1.1, foliageColor: '#68B684' },
        { x: 2.45, z: -1.9, kind: 'pine', scale: 1.2, foliageColor: '#52B788' },
        { x: 2.55, z: -0.9, kind: 'cherry_blossom', scale: 1.15, foliageColor: '#FFB7C5' },
        { x: -0.25, z: -2.35, kind: 'pine', scale: 1.05, foliageColor: '#52B788' },
        { x: 0.95, z: -2.35, kind: 'oak', scale: 1.1, foliageColor: '#76C893' },
        { x: -1.4, z: -2.35, kind: 'cherry_blossom', scale: 1.25, foliageColor: '#FFC6D0' },
        { x: 2.35, z: 1.85, kind: 'ginkgo', scale: 1.0, foliageColor: '#FFD166' },
        { x: 1.15, z: 2.1, kind: 'cherry_blossom', scale: 1.15, foliageColor: '#FFB7C5' },
      ],
      pins: [
        {
          id: 'pin-park',
          title: 'Seoul Forest Trail (94% Lush)',
          detail: 'Verified Observation: Cherry blossom & deer park entrance right next to the complex.',
          category: 'park',
          icon: '🌸',
          x: -2.3,
          z: -0.35,
          sentiment: 'positive',
          evidenceType: 'verified_observation',
        },
        {
          id: 'pin-subway',
          title: 'Ttukseom Stn. (5 min walk)',
          detail: 'Verified Observation: Flat pedestrian sidewalk straight to Line 2 & Suin-Bundang Line.',
          category: 'subway',
          icon: '🚇',
          x: 2.05,
          z: 1.25,
          sentiment: 'positive',
          evidenceType: 'verified_observation',
        },
        {
          id: 'pin-noise',
          title: 'Weekend Cafe Traffic (58 dB)',
          detail: 'Verified Observation: Street buzz along the red-brick cafe strip on weekends.',
          category: 'noise',
          icon: '🔊',
          x: 0.0,
          z: 1.55,
          sentiment: 'caution',
          evidenceType: 'verified_observation',
        },
        {
          id: 'pin-hill',
          title: 'Flat Terrain (3° Incline)',
          detail: 'Verified Observation: Effortless walkability for strollers, bikes, and daily commuting.',
          category: 'hill',
          icon: '👟',
          x: 1.35,
          z: -1.45,
          sentiment: 'positive',
          evidenceType: 'verified_observation',
        },
      ],
      stamp: {
        badgeTitle: 'Seongsu Forest Ranger',
        stampColor: '#3CB371',
        stampIcon: 'sakura',
        motto: 'Captured Seongsu-dong (Grade S)',
      },
    },
    verification: {
      modelUsed: 'gemini-4-argon',
      thinkingLevel: 'high',
      interactionId: 'int_argon_seongsu_01',
      verifierInteractionId: 'int_argon_seongsu_ver_02',
      overallFidelityScore: 99,
      iterationsRun: 2,
      patchCount: 1,
      summary: 'Gemini 4 Argon verified flat 3° topography, 12 Seoul Forest canopy trees, and auto-patched weekend avenue noise waves (58 dB).',
      verifiedObservations: [
        'Flat 3° pedestrian access from Ttukseom Station (5-min walk) verified from voice note.',
        'Lush Seoul Forest cherry blossom & oak canopy (94% greenery) verified from photo #1.',
        'Red-brick roastery cafe alley and 58 dB weekend traffic acoustics verified from photo #2 & voice note.',
      ],
      aiInterpretations: [
        'Stylized Animal Crossing-inspired miniature proportions and warm sunset lighting.',
        'Inferred S-grade fit for dual-income young couples prioritizing parks and Line 2 commute.',
      ],
      checks: [
        {
          checkName: 'Topography & Flat Walkability',
          category: 'terrain',
          status: 'passed',
          initialValue: '3° tilt (Flat)',
          verifiedValue: '3° tilt (Flat Walk)',
          reasoning: 'Confirmed flat pedestrian access from Ttukseom Station.',
        },
        {
          checkName: 'Seoul Forest Canopy Density',
          category: 'greenery',
          status: 'passed',
          initialValue: '12 park trees',
          verifiedValue: '12 cherry blossom & oak trees',
          reasoning: 'Matched 94/100 greenery rating and Seoul Forest observation.',
        },
        {
          checkName: 'Weekend Cafe Street Acoustics',
          category: 'acoustics',
          status: 'auto_patched',
          initialValue: '35 dB (No rings)',
          verifiedValue: '58 dB + Pulsing Acoustic Rings',
          reasoning: 'Voice note highlighted weekend traffic & crowd noise; enabled 3D acoustic wave visualization.',
        },
      ],
    },
  },
  {
    id: 'mem-oksu-initial',
    createdAt: '2026-10-16T10:40:00.000Z',
    neighborhoodId: 'oksu-hilltop',
    neighborhoodName: 'Oksu / Hannam Hilltop',
    neighborhoodNameKo: '옥수동 파크힐스',
    district: 'Seongdong-gu',
    apartmentName: 'Oksu Park Hills 108-dong',
    observation: {
      neighborhoodId: 'oksu-hilltop',
      neighborhoodName: 'Oksu / Hannam Hilltop',
      neighborhoodNameKo: '옥수동 파크힐스',
      district: 'Seongdong-gu',
      apartmentName: 'Oksu Park Hills 108-dong',
      subwayStation: 'Oksu Station',
      subwayLine: 'Line 3 & Gyeongui-Jungang',
      subwayLineColor: '#FF7F32',
      voiceNoteText:
        'Right outside Oksu Station Exit 4, but the uphill climb into the apartment complex is quite steep with lots of stairs! Once inside, it is super peaceful with zero traffic noise and sweeping Han River views.',
      voiceLanguage: 'en-US',
      photos: [],
      quickRatings: {
        hillSteepness: 84,
        parkGreenery: 68,
        subwayWalkMinutes: 4,
        trafficNoise: 28,
        cafeMartConvenience: 76,
      },
    },
    blueprint: {
      worldTitle: 'Oksu Hilltop Panorama Sanctuary',
      tagline: 'Terraced Hillside Living Overlooking the Han River',
      englishSummary:
        'An elevated 18° hillside 3D diorama of Oksu Park Hills featuring terraced stairs, ultra-fast 4-minute Line 3 station access, serene 28 dB acoustics, and southern Han River views.',
      originalNotesSummary:
        '4-min walk to Oksu Stn, steep 18° uphill climb with outdoor stairs, whisper-quiet upper complex, panoramic Han River overlook.',
      timeOfDay: 'golden_hour',
      islandPalette: {
        grassColor: '#95D5B2',
        earthColor: '#DDA15E',
        roadColor: '#E6CCB2',
        skyAccentColor: '#FFE5D9',
        waterColor: '#72EFDD',
      },
      terrain: {
        slopeDegrees: 18,
        slopeDirection: 'north',
        hasHillsideStairs: true,
        hasRiverOrLake: true,
        waterSide: 'south',
      },
      transit: {
        stationName: 'Oksu Station',
        lineName: 'Line 3 & Gyeongui-Jungang',
        lineColor: '#FF7F32',
        walkMinutes: 4,
        x: 2.05,
        z: 1.25,
      },
      traffic: {
        noiseLevel: 28,
        carCount: 1,
        showNoiseWaves: false,
        noiseSourceLabel: 'Serene Upper Terrace',
      },
      livabilityMetrics: {
        walkabilityScore: 64,
        transitScore: 95,
        natureScore: 78,
        quietnessScore: 92,
        convenienceScore: 78,
        overallGrade: 'A+',
      },
      homebuyerInsights: {
        pros: [
          '4-minute direct access to Oksu Station (Line 3 — Apgujeong in 1 stop)',
          'Whisper-quiet upper complex (28 dB) insulated from road noise',
          'Open southern views toward the Han River',
        ],
        watchOuts: [
          'Steep 18° uphill climb & stairs from station gate to upper buildings',
          'Check indoor/outdoor elevator path for strollers and rainy days',
        ],
        bestForPersona: 'Gangnam/CBD commuters who prize quiet hilltop privacy and river views',
        aiVerdict: 'Grade A+: Unbeatable Line 3 proximity and quietness, provided you embrace the hillside elevation.',
      },
      buildings: [
        {
          id: 'apt-oksu-1',
          kind: 'apartment',
          label: 'Oksu Park Hills 108',
          x: -1.35,
          z: -1.15,
          width: 1.15,
          depth: 0.9,
          floors: 11,
          wallColor: '#FFF5EB',
          roofColor: '#E07A5F',
          roofStyle: 'flat',
        },
        {
          id: 'apt-oksu-2',
          kind: 'apartment',
          label: 'Oksu Park Hills 105',
          x: 0.25,
          z: -1.45,
          width: 1.0,
          depth: 0.85,
          floors: 9,
          wallColor: '#FDF0D5',
          roofColor: '#8FB8DE',
          roofStyle: 'flat',
        },
        {
          id: 'villa-oksu',
          kind: 'house',
          label: 'Hillside View Pavilion',
          x: 1.45,
          z: -1.65,
          width: 0.85,
          depth: 0.8,
          floors: 3,
          wallColor: '#F6E8EA',
          roofColor: '#E07A5F',
          roofStyle: 'pitched',
        },
      ],
      trees: [
        { x: -2.55, z: -2.05, kind: 'pine', scale: 1.2, foliageColor: '#52B788' },
        { x: -2.35, z: -0.35, kind: 'oak', scale: 1.1, foliageColor: '#76C893' },
        { x: -0.65, z: 0.2, kind: 'ginkgo', scale: 1.05, foliageColor: '#FFD166' },
        { x: 0.85, z: 0.15, kind: 'oak', scale: 1.1, foliageColor: '#68B684' },
        { x: 2.45, z: -1.9, kind: 'pine', scale: 1.25, foliageColor: '#52B788' },
        { x: -0.25, z: -2.35, kind: 'cherry_blossom', scale: 1.15, foliageColor: '#FFB7C5' },
        { x: 0.95, z: -2.35, kind: 'pine', scale: 1.1, foliageColor: '#52B788' },
        { x: -1.4, z: -2.35, kind: 'oak', scale: 1.15, foliageColor: '#76C893' },
      ],
      pins: [
        {
          id: 'pin-oksu-hill',
          title: 'Steep Incline (18° + Stairs)',
          detail: 'Verified Observation: Substantial uphill slope from station exit; outdoor stairs connect tiers.',
          category: 'hill',
          icon: '⛰️',
          x: 1.35,
          z: -1.45,
          sentiment: 'caution',
          evidenceType: 'verified_observation',
        },
        {
          id: 'pin-oksu-subway',
          title: 'Oksu Station (4 min walk)',
          detail: 'Verified Observation: Line 3 & Gyeongui-Jungang transfer right at the foot of the hill.',
          category: 'subway',
          icon: '🚇',
          x: 2.05,
          z: 1.25,
          sentiment: 'positive',
          evidenceType: 'verified_observation',
        },
        {
          id: 'pin-oksu-noise',
          title: 'Serene Sanctuary (28 dB)',
          detail: 'Verified Observation: Elevated complex blocks out arterial traffic noise.',
          category: 'noise',
          icon: '🍃',
          x: 0.0,
          z: 1.55,
          sentiment: 'positive',
          evidenceType: 'verified_observation',
        },
      ],
      stamp: {
        badgeTitle: 'Oksu Summit Climber',
        stampColor: '#FF7F32',
        stampIcon: 'mountain',
        motto: 'Conquered the 18° Hilltop (Grade A+)',
      },
    },
    verification: {
      modelUsed: 'gemini-4-argon',
      thinkingLevel: 'high',
      interactionId: 'int_argon_oksu_01',
      verifierInteractionId: 'int_argon_oksu_ver_02',
      overallFidelityScore: 98,
      iterationsRun: 2,
      patchCount: 2,
      summary: 'Gemini 4 Argon auto-patched terrain tilt from 8° to 18° and injected 3D hillside stairway geometry to match your steep-climb observation.',
      verifiedObservations: [
        'Steep 18° uphill climb & outdoor stairway verified from photo #1 and voice note.',
        '4-minute walk to Oksu Station (Line 3) verified at base of hillside.',
        'Quiet 28 dB upper-tier residential zone verified from user voice impression.',
      ],
      aiInterpretations: [
        'Stylized terraced hillside tiers and southern Han River water strip.',
        'Recommended for Gangnam/CBD commuters prioritizing Line 3 speed and quiet nights.',
      ],
      checks: [
        {
          checkName: 'Topography & Hillside Incline Check',
          category: 'terrain',
          status: 'auto_patched',
          initialValue: '8° tilt (No stairs)',
          verifiedValue: '18° tilt + Hillside Stairway',
          reasoning: 'User emphasized steep uphill climb & stairs; patched island slope to 18° and added stepped walkway.',
        },
        {
          checkName: 'Subway Proximity & Commute Vector',
          category: 'transit',
          status: 'passed',
          initialValue: '4 min walk',
          verifiedValue: '4 min to Oksu Station (Line 3)',
          reasoning: 'Verified station portal at base of hill.',
        },
        {
          checkName: 'Acoustic Isolation Check',
          category: 'acoustics',
          status: 'auto_patched',
          initialValue: '48 dB',
          verifiedValue: '28 dB (Quiet Zone)',
          reasoning: 'Suppressed traffic noise waves to reflect user note of zero traffic noise inside upper complex.',
        },
      ],
    },
  },
];
