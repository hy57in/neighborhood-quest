import type { SceneBlueprint, VerificationReport } from '../types.ts';

export type SensoryLayerType = 'all' | 'incline' | 'greenery' | 'noise' | 'mood';

export type SensoryPriorityId =
  | 'sunset_lighting'
  | 'park_forest'
  | 'quiet_night'
  | 'cafe_alley'
  | 'open_view'
  | 'safe_walkway';

export interface LiquidityItem {
  score: number; // 0 - 100
  label: string;
  labelKo?: string;
  labelEn?: string;
  detail: string;
  detailKo?: string;
  detailEn?: string;
}

/**
 * 객관적 입지 (환금성 6대 기준)
 * 1. 브랜드 (brand)
 * 2. 신축 (newBuild)
 * 3. 역세권 (subway)
 * 4. 학군 (school)
 * 5. 평지 (flatness)
 * 6. 세대수 (households)
 */
export interface LiquidityMetrics {
  brand: LiquidityItem;
  newBuild: LiquidityItem;
  subway: LiquidityItem;
  school: LiquidityItem;
  flatness: LiquidityItem;
  households: LiquidityItem;
  totalScore: number;
  grade: 'S' | 'A+' | 'A' | 'B+' | 'B';
}

export interface SensoryMetric {
  type: 'incline' | 'coziness' | 'noise' | 'greenery';
  title: string;
  titleEn?: string;
  value: string;
  valueEn?: string;
  numericValue: number;
  status: string;
  statusEn?: string;
  subtext: string;
  subtextEn?: string;
  icon: string;
  colorClass: string;
}

export interface AudioMemo {
  id: string;
  title: string;
  titleEn?: string;
  durationSeconds: number;
  durationStr: string;
  quote: string;
  quoteEn?: string;
  recordedAt: string;
  recordedAtEn?: string;
}

export interface PhotoRecord {
  id: string;
  url: string;
  alt: string;
  altEn?: string;
  caption: string;
  captionEn?: string;
  timeTaken: string;
  timeTakenEn?: string;
}

export interface MemoryLayers {
  physical: string[];
  sensory: string[];
  emotional: string[];
}

export interface NeighborhoodData {
  id: string;
  name: string;
  nameEn?: string;
  subName: string;
  subNameEn?: string;
  stationDistance: string;
  stationDistanceEn?: string;
  timeContext: string;
  timeContextEn?: string;
  quote: string;
  quoteEn?: string;
  quoteAuthor: string;
  dioramaImageUrl: string;
  inclineAngleDeg: number;
  inclinePercent: number;
  cozinessPercent: number;
  noiseDb: number;
  greenWalkMinutes: number;
  metrics: SensoryMetric[];
  audioMemo: AudioMemo;
  photos: PhotoRecord[];
  tags: string[];
  tagsEn?: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  perspective?: 'pingu' | 'gyodong';
  sensoryPriorities?: SensoryPriorityId[];
  liquidity?: LiquidityMetrics;
  memoryLayers?: MemoryLayers;
  geminiVerifiedAt?: string;
  blueprint?: SceneBlueprint;
  verification?: VerificationReport;
}

export type TabType = 'explore' | 'diorama' | 'compare' | 'bookmarks' | 'record';
export type Lang = 'ko' | 'en';
