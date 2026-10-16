import { Lang } from '../types/index.ts';

/**
 * Pure calculation and formatting utilities for sensory neighborhood metrics
 */

export function getInclineLabel(percent: number, lang: Lang = 'ko'): string {
  if (lang === 'en') {
    if (percent >= 80) return 'Steep';
    if (percent >= 60) return 'Moderate Slope';
    if (percent >= 30) return 'Gentle Slope';
    return 'Flat';
  }
  if (percent >= 80) return '가파름';
  if (percent >= 60) return '완만한 오르막';
  if (percent >= 30) return '약간의 경사';
  return '평지';
}

export function getNoiseLabel(db: number, lang: Lang = 'ko'): string {
  if (lang === 'en') {
    if (db <= 30) return 'Quiet';
    if (db <= 45) return 'Calm';
    if (db <= 60) return 'Moderate';
    return 'Busy';
  }
  if (db <= 30) return '조용함';
  if (db <= 45) return '잔잔함';
  if (db <= 60) return '보통';
  return '번잡함';
}

export function getCozinessLabel(percent: number, lang: Lang = 'ko'): string {
  if (lang === 'en') {
    if (percent >= 90) return 'Superb';
    if (percent >= 75) return 'Good';
    if (percent >= 55) return 'Fair';
    return 'Dim';
  }
  if (percent >= 90) return '최상';
  if (percent >= 75) return '좋음';
  if (percent >= 55) return '보통';
  return '다소 어두움';
}

export function getGreeneryLabel(minutes: number, lang: Lang = 'ko'): string {
  if (lang === 'en') {
    if (minutes <= 3) return 'Lush (Steps away)';
    if (minutes <= 7) return 'Good';
    return 'Fair';
  }
  if (minutes <= 3) return '쾌적 (도보 초근접)';
  if (minutes <= 7) return '양호';
  return '보통';
}

/**
 * Calculates a composite sensory live comfort score (0-100)
 * Higher coziness is good, lower noise is good, lower greenMinutes is good, moderate incline has charm
 */
export function calculateSensoryComfortScore(
  inclinePercent: number,
  cozinessPercent: number,
  noiseDb: number,
  greenMinutes: number
): number {
  // Normalize each:
  // Coziness (0-100) -> weight 30%
  const cozinessScore = Math.max(0, Math.min(100, cozinessPercent)) * 0.3;

  // Noise (20dB is 100, 70dB is 0) -> weight 30%
  const noiseNormalized = Math.max(0, Math.min(100, (70 - noiseDb) * 2));
  const noiseScore = noiseNormalized * 0.3;

  // Greenery (0 min is 100, 15 min is 0) -> weight 25%
  const greenNormalized = Math.max(0, Math.min(100, (15 - greenMinutes) * (100 / 15)));
  const greenScore = greenNormalized * 0.25;

  // Incline accessibility (steepness ease: 0% is 100 ease, 100% steep is 40 ease) -> weight 15%
  const inclineEase = Math.max(40, 100 - inclinePercent * 0.6);
  const inclineScore = inclineEase * 0.15;

  const total = Math.round(cozinessScore + noiseScore + greenScore + inclineScore);
  return Math.min(100, Math.max(0, total));
}

export function formatTimeSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
