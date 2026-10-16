export interface PhotoInput {
  id: string;
  dataUrl: string; // data:image/jpeg;base64,...
  mimeType: string;
  caption: string;
  tag: 'street' | 'apartment' | 'park' | 'subway' | 'hill';
}

export interface FieldObservationInput {
  neighborhoodId: string;
  neighborhoodName: string;
  neighborhoodNameKo: string;
  district: string;
  apartmentName: string;
  subwayStation: string;
  subwayLine: string;
  subwayLineColor: string;
  voiceNoteText: string;
  voiceLanguage: 'ko-KR' | 'en-US';
  photos: PhotoInput[];
  quickRatings: {
    hillSteepness: number; // 0 (flat) to 100 (very steep)
    parkGreenery: number; // 0 (concrete) to 100 (lush forest)
    subwayWalkMinutes: number; // 1 to 25 mins
    trafficNoise: number; // 0 (serene) to 100 (busy road)
    cafeMartConvenience: number; // 0 to 100
  };
}

export interface BuildingSpec {
  id: string;
  kind: 'apartment' | 'cafe' | 'house' | 'convenience_store' | 'community_center';
  label: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floors: number;
  wallColor: string;
  roofColor: string;
  roofStyle: 'flat' | 'pitched' | 'terrace' | 'mansard';
}

export interface TreeSpec {
  x: number;
  z: number;
  kind: 'cherry_blossom' | 'pine' | 'oak' | 'ginkgo';
  scale: number;
  foliageColor: string;
}

export interface ObservationPinSpec {
  id: string;
  title: string;
  detail: string;
  category: 'hill' | 'park' | 'subway' | 'noise' | 'vibe';
  icon: string;
  x: number;
  z: number;
  sentiment: 'positive' | 'neutral' | 'caution';
  evidenceType?: 'verified_observation' | 'ai_interpretation';
}

export interface VerificationCheck {
  checkName: string;
  category: 'terrain' | 'transit' | 'greenery' | 'acoustics' | 'architecture';
  status: 'passed' | 'auto_patched';
  initialValue: string;
  verifiedValue: string;
  reasoning: string;
}

export interface VerificationReport {
  modelUsed: string;
  thinkingLevel: string;
  interactionId: string;
  verifierInteractionId: string;
  overallFidelityScore: number;
  iterationsRun: number;
  patchCount: number;
  summary: string;
  verifiedObservations: string[]; // Directly supported by user photos/voice notes
  aiInterpretations: string[]; // Stylized or inferred context clearly distinguished from facts
  checks: VerificationCheck[];
}

export interface SceneBlueprint {
  worldTitle: string;
  tagline: string;
  englishSummary: string;
  originalNotesSummary: string;
  timeOfDay: 'morning' | 'golden_hour' | 'twilight';
  islandPalette: {
    grassColor: string;
    earthColor: string;
    roadColor: string;
    skyAccentColor: string;
    waterColor: string;
  };
  terrain: {
    slopeDegrees: number;
    slopeDirection: 'north' | 'east' | 'west';
    hasHillsideStairs: boolean;
    hasRiverOrLake: boolean;
    waterSide: 'south' | 'west' | 'east' | 'none';
  };
  transit: {
    stationName: string;
    lineName: string;
    lineColor: string;
    walkMinutes: number;
    x: number;
    z: number;
  };
  traffic: {
    noiseLevel: number;
    carCount: number;
    showNoiseWaves: boolean;
    noiseSourceLabel: string;
  };
  livabilityMetrics: {
    walkabilityScore: number;
    transitScore: number;
    natureScore: number;
    quietnessScore: number;
    convenienceScore: number;
    overallGrade: 'S' | 'A+' | 'A' | 'B+' | 'B';
  };
  homebuyerInsights: {
    pros: string[];
    watchOuts: string[];
    bestForPersona: string;
    aiVerdict: string;
  };
  buildings: BuildingSpec[];
  trees: TreeSpec[];
  pins: ObservationPinSpec[];
  stamp: {
    badgeTitle: string;
    stampColor: string;
    stampIcon: 'sakura' | 'mountain' | 'train' | 'coffee' | 'river' | 'sparkles';
    motto: string;
  };
}

export interface NeighborhoodMemory {
  id: string;
  createdAt: string;
  neighborhoodId: string;
  neighborhoodName: string;
  neighborhoodNameKo: string;
  district: string;
  apartmentName: string;
  observation: FieldObservationInput;
  blueprint: SceneBlueprint;
  verification: VerificationReport;
}

export interface NeighborhoodSpot {
  id: string;
  name: string;
  nameKo: string;
  district: string;
  apartmentName: string;
  subwayStation: string;
  subwayLine: string;
  subwayLineColor: string;
  mapX: number;
  mapY: number;
  vibeTag: string;
  shortDesc: string;
  avgPriceTag: string;
  starterHomePriceMillionKRW: number; // e.g., 950 = ₩950M (9.5억) for 59㎡ starter unit
  defaultRatings: FieldObservationInput['quickRatings'];
  sampleVoiceNoteKo: string;
  sampleVoiceNoteEn: string;
  presetPhotos: Array<{
    caption: string;
    tag: PhotoInput['tag'];
    sceneType: 'hill_alley' | 'subway_exit' | 'park_trail' | 'brick_cafe' | 'apt_complex' | 'lake_view';
  }>;
}

// ============================================================================
// PolicyQuest: 3D Village NPCs, Housing Quest & LTV/DSR Policy Verification
// ============================================================================

export interface NpcResident {
  id: string;
  name: string;
  roleTitle: string;
  avatarEmoji: string;
  shirtColor: string;
  hatColor: string;
  x: number; // 3D island position
  z: number;
  annualIncomeMillionKRW: number; // e.g., 96 = ₩96M/yr
  cashSavingsMillionKRW: number; // e.g., 420 = ₩420M
  existingAnnualDebtPaymentMillionKRW: number; // e.g., 8 = ₩8M/yr
  isFirstTimeBuyer: boolean;
  questTitle: string;
  questPrompt: string;
}

export interface PolicyDocumentPreset {
  id: string;
  title: string;
  badge: string;
  rawPolicyText: string;
  defaultRules: {
    policyTitleEn: string;
    ltvFirstTimePercent: number;
    ltvStandardPercent: number;
    dsrLimitPercent: number;
    baseInterestRatePercent: number;
    stressDsrBufferPercent: number;
    youthSubsidyMillionKRW: number;
  };
}

export interface NpcPolicyOutcome {
  npcId: string;
  npcName: string;
  targetHomePriceMillionKRW: number;
  maxLtvLoanMillionKRW: number;
  maxDsrLoanMillionKRW: number;
  finalApprovedLoanMillionKRW: number;
  bindingConstraint: 'LTV' | 'DSR';
  totalPurchasingPowerMillionKRW: number;
  shortfallMillionKRW: number;
  canBuyHome: boolean;
  npcReactionDialogueEn: string;
  questResolutionNoteEn: string;
}

export interface PolicyVerificationCheck {
  ruleName: string;
  status: 'passed' | 'auto_patched';
  initialDraft: string;
  verifiedRule: string;
  explanation: string;
}

export interface PolicyAnalysisResult {
  policyTitleEn: string;
  policySummaryEn: string;
  extractedRules: {
    ltvFirstTimePercent: number;
    ltvStandardPercent: number;
    dsrLimitPercent: number;
    baseInterestRatePercent: number;
    stressDsrBufferPercent: number;
    effectiveRatePercent: number;
    youthSubsidyMillionKRW: number;
  };
  npcOutcomes: NpcPolicyOutcome[];
  verification: {
    modelUsed: string;
    thinkingLevel: string;
    interactionId: string;
    verifierInteractionId: string;
    fidelityScore: number;
    patchCount: number;
    summary: string;
    checks: PolicyVerificationCheck[];
  };
}
