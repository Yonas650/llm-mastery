"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { MetricBadge } from "@/components/figures/MetricBadge";

type NumberSetter = Dispatch<SetStateAction<number>>;

export function InferenceLatencySimulator() {
  const [promptTokens, setPromptTokens] = useState(1800);
  const [outputTokens, setOutputTokens] = useState(220);
  const [batchSize, setBatchSize] = useState(6);
  const [quantized, setQuantized] = useState(false);
  const controls: Array<[string, number, number, number, NumberSetter]> = [
    ["Prompt tokens", promptTokens, 128, 8000, setPromptTokens],
    ["Output tokens", outputTokens, 16, 1200, setOutputTokens],
    ["Batch size", batchSize, 1, 32, setBatchSize]
  ];

  const metrics = useMemo(() => {
    const prefill = promptTokens * (quantized ? 0.0016 : 0.0023);
    const decodePerToken = (quantized ? 0.018 : 0.026) * (1 + Math.max(0, batchSize - 1) * 0.07);
    const queue = Math.max(0, batchSize - 1) * 18;
    const total = queue + prefill * 1000 + decodePerToken * outputTokens * 1000;
    return { prefill: prefill * 1000, decode: decodePerToken * outputTokens * 1000, queue, total };
  }, [batchSize, outputTokens, promptTokens, quantized]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Inference latency simulator</h3>
        <p className="text-sm text-muted">Separate queue, prefill, and decode costs.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <MetricBadge label="queue" value={`${metrics.queue.toFixed(0)} ms`} />
        <MetricBadge label="prefill" value={`${metrics.prefill.toFixed(0)} ms`} />
        <MetricBadge label="decode" value={`${metrics.decode.toFixed(0)} ms`} />
        <MetricBadge label="total" value={`${metrics.total.toFixed(0)} ms`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
              checked={quantized}
              className="accent-teal-700"
              onChange={(event) => setQuantized(event.target.checked)}
              type="checkbox"
            />
            quantized weights
          </label>
        </div>
        <div className="space-y-2 rounded-md border border-line bg-wash p-3">
          {[
            ["Queue", metrics.queue, "bg-amber-500"],
            ["Prefill", metrics.prefill, "bg-teal-500"],
            ["Decode", metrics.decode, "bg-graphite"]
          ].map(([label, value, color]) => (
            <div key={String(label)}>
              <div className="mb-1 flex justify-between text-xs font-semibold text-muted">
                <span>{String(label)}</span>
                <span>{Number(value).toFixed(0)} ms</span>
              </div>
              <div className="h-4 rounded bg-line">
                <div
                  className={`h-4 rounded ${String(color)}`}
                  style={{ width: `${Math.min(100, (Number(value) / metrics.total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
