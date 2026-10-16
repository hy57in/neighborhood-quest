import React from 'react';
import { Lang, SensoryMetric } from '../types/index.ts';

interface SensoryMetricsGridProps {
  metrics: SensoryMetric[];
  onMetricClick?: (metric: SensoryMetric) => void;
  lang?: Lang;
}

export const SensoryMetricsGrid: React.FC<SensoryMetricsGridProps> = ({
  metrics,
  onMetricClick,
  lang = 'ko',
}) => {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-[16px] font-bold text-[#191f28] tracking-tight">
          {lang === 'ko' ? '체감 감각 지표' : 'Perceived Sensory Metrics'}
        </h2>
        <span className="text-[12px] font-medium text-[#3182f6]">
          {lang === 'ko' ? '실시간 보정 데이터' : 'Live Calibrated Data'}
        </span>
      </div>

      {/* 2x2 Clean Modern Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {metrics.map((metric) => (
          <div
            key={metric.type}
            onClick={() => onMetricClick?.(metric)}
            className="bg-white rounded-2xl p-3.5 border border-[#edf0f3] flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-[#3182f6]/40 cursor-pointer active:scale-98"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium text-[#4e5968]">{metric.title}</span>
              <span className={`material-symbols-outlined text-[17px] ${metric.colorClass}`}>
                {metric.icon}
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-[#191f28] tracking-tight">
                  {metric.value}
                </span>
                <span className={`text-[12px] font-bold ${metric.colorClass}`}>
                  {metric.status}
                </span>
              </div>
              <p className="text-[11px] text-[#8b95a1] mt-0.5">{metric.subtext}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
