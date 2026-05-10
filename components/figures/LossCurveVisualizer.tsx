"use client";

import { useMemo, useState } from "react";
import { MetricBadge } from "@/components/figures/MetricBadge";

export function LossCurveVisualizer() {
  const [correctProbability, setCorrectProbability] = useState(0.2);
  const [tokensSeen, setTokensSeen] = useState(35);
  const loss = -Math.log(correctProbability);
  const perplexity = Math.exp(loss);
  const curve = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => {
        const progress = (index + 1) / 18;
        return 4.2 - Math.log1p(progress * tokensSeen) * 0.72;
      }),
    [tokensSeen]
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Cross-entropy and perplexity</h3>
        <p className="text-sm text-muted">
          Move probability mass onto the correct token and watch loss collapse.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBadge label="p(correct)" value={correctProbability.toFixed(2)} />
        <MetricBadge label="cross-entropy" value={`${loss.toFixed(3)} nats`} />
        <MetricBadge label="perplexity" value={perplexity.toFixed(2)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-md border border-line bg-white p-3">
          <label className="block text-sm font-medium text-graphite">
            Probability on observed token
            <input
              className="mt-2 w-full accent-teal-700"
              max="0.95"
              min="0.01"
              onChange={(event) => setCorrectProbability(Number(event.target.value))}
              step="0.01"
              type="range"
              value={correctProbability}
            />
          </label>
          <label className="block text-sm font-medium text-graphite">
            Tokens seen in training
            <input
              className="mt-2 w-full accent-teal-700"
              max="100"
              min="1"
              onChange={(event) => setTokensSeen(Number(event.target.value))}
              step="1"
              type="range"
              value={tokensSeen}
            />
          </label>
          <p className="rounded-md bg-wash p-3 text-sm leading-6 text-graphite">
            Perplexity is exp(loss). It reads like an effective number of plausible next-token
            branches, not a direct truthfulness score.
          </p>
        </div>

        <div className="flex h-64 items-end gap-1 rounded-md border border-line bg-wash p-3">
          {curve.map((value, index) => {
            const height = Math.max(12, Math.min(100, value * 24));
            return (
              <div className="flex flex-1 flex-col items-center gap-2" key={`${value}-${index}`}>
                <div
                  className="w-full rounded-t bg-teal-500"
                  style={{ height: `${height}%` }}
                  title={`step ${index + 1}: validation loss ${value.toFixed(2)}`}
                />
                {index % 5 === 0 ? (
                  <span className="text-[10px] text-muted">{index + 1}</span>
                ) : (
                  <span className="h-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
