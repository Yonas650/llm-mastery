"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { MetricBadge } from "@/components/figures/MetricBadge";

type NumberSetter = Dispatch<SetStateAction<number>>;

export function BatchThroughputSimulator() {
  const [batch, setBatch] = useState(8);
  const [maxWait, setMaxWait] = useState(30);
  const [outputTokens, setOutputTokens] = useState(180);
  const [continuous, setContinuous] = useState(true);
  const controls: Array<[string, number, number, number, NumberSetter]> = [
    ["Batch size", batch, 1, 64, setBatch],
    ["Max wait ms", maxWait, 0, 200, setMaxWait],
    ["Output tokens", outputTokens, 16, 1000, setOutputTokens]
  ];

  const metrics = useMemo(() => {
    const utilization = Math.min(0.96, 0.28 + Math.log2(batch + 1) * 0.15 + (continuous ? 0.12 : 0));
    const throughput = utilization * 1200;
    const perRequestLatency = maxWait + outputTokens * (continuous ? 18 : 23) * (1 + batch * 0.015);
    return { utilization, throughput, perRequestLatency };
  }, [batch, continuous, maxWait, outputTokens]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Batch throughput simulator</h3>
        <p className="text-sm text-muted">Batching raises utilization but changes waiting and fairness.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBadge label="utilization" value={`${(metrics.utilization * 100).toFixed(0)}%`} />
        <MetricBadge label="throughput" value={`${metrics.throughput.toFixed(0)} tok/s`} />
        <MetricBadge label="latency" value={`${metrics.perRequestLatency.toFixed(0)} ms`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-md border border-line bg-white p-3">
          {controls.map(([label, value, min, max, setter]) => (
            <label className="block text-sm font-medium text-graphite" key={String(label)}>
              {label}: {String(value)}
              <input
                className="mt-2 w-full accent-teal-700"
                max={Number(max)}
                min={Number(min)}
                onChange={(event) =>
                  setter(Number(event.target.value))
                }
                step="1"
                type="range"
                value={Number(value)}
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm font-medium text-graphite">
            <input
              checked={continuous}
              className="accent-teal-700"
              onChange={(event) => setContinuous(event.target.checked)}
              type="checkbox"
            />
            continuous batching
          </label>
        </div>
        <div className="grid content-end gap-2 rounded-md border border-line bg-wash p-3">
          {Array.from({ length: Math.min(batch, 24) }, (_, index) => (
            <div className="flex items-center gap-2" key={index}>
              <div className="h-5 w-12 rounded bg-teal-500" title="Active decode slot" />
              <div
                className="h-2 rounded bg-graphite"
                style={{ width: `${Math.max(12, 90 - index * 2)}%` }}
                title="Generated token stream"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
