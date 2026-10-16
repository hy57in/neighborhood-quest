import { Lang, NeighborhoodData, SensoryMetric } from '../types/index.ts';

export function localizeNeighborhood(n: NeighborhoodData, lang: Lang): NeighborhoodData {
  if (lang === 'ko') return n;
  return {
    ...n,
    name: n.nameEn || n.name,
    subName: n.subNameEn || n.subName,
    stationDistance: n.stationDistanceEn || n.stationDistance,
    timeContext: n.timeContextEn || n.timeContext,
    quote: n.quoteEn || n.quote,
    tags: n.tagsEn || n.tags,
    metrics: n.metrics.map((m: SensoryMetric) => ({
      ...m,
      title: m.titleEn || m.title,
      value: m.valueEn || m.value,
      status: m.statusEn || m.status,
      subtext: m.subtextEn || m.subtext,
    })),
    audioMemo: {
      ...n.audioMemo,
      title: n.audioMemo.titleEn || n.audioMemo.title,
      quote: n.audioMemo.quoteEn || n.audioMemo.quote,
      recordedAt: n.audioMemo.recordedAtEn || n.audioMemo.recordedAt,
    },
    photos: n.photos.map((p) => ({
      ...p,
      alt: p.altEn || p.alt,
      caption: p.captionEn || p.caption,
      timeTaken: p.timeTakenEn || p.timeTaken,
    })),
  };
}
