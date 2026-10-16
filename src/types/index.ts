export type SensoryLayerType = 'all' | 'incline' | 'greenery' | 'noise' | 'mood';

export interface SensoryMetric {
  type: 'incline' | 'coziness' | 'noise' | 'greenery';
  title: string;
  titleEn?: string;
  value: string;
  valueEn?: string;
  numericValue: number; // 0-100 or dB or mins
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
  perspective?: 'jamie' | 'sam';
  memoryLayers?: MemoryLayers;
  geminiVerifiedAt?: string;
}

export type TabType = 'explore' | 'diorama' | 'compare' | 'bookmarks' | 'record';
export type Lang = 'ko' | 'en';
