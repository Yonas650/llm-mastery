"use client";

import { useMemo, useState } from "react";
import { MetricBadge } from "@/components/figures/MetricBadge";

const candidates = [" model", " token", " loss", " GPU"];

function softmax(logits: number[]): number[] {
  const max = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}

export function TokenPredictionVisualizer() {
  const [targetIndex, setTargetIndex] = useState(1);
  const [sharpness, setSharpness] = useState(1.3);
  const [domainBias, setDomainBias] = useState(0.4);

  const logits = useMemo(
    () => [
      1.0 * sharpness,
      (1.2 + domainBias) * sharpness,
      (0.4 + domainBias * 0.7) * sharpness,
      0.2 * sharpness
    ],
    [domainBias, sharpness]
  );
  const probabilities = useMemo(() => softmax(logits), [logits]);
  const loss = -Math.log(probabilities[targetIndex]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">Next-token prediction</h3>
        <p className="text-sm leading-6 text-muted">
          Context: <span className="font-semibold text-graphite">Pretraining updates the</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBadge label="target token" value={candidates[targetIndex].trim()} />
        <MetricBadge label="p(target)" value={probabilities[targetIndex].toFixed(3)} />
        <MetricBadge label="loss" value={`${loss.toFixed(3)} nats`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-md border border-line bg-white p-3">
          <label className="block text-sm font-medium text-graphite">
            Correct next token
            <select
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
              onChange={(event) => setTargetIndex(Number(event.target.value))}
              value={targetIndex}
            >
              {candidates.map((token, index) => (
                <option key={token} value={index}>
                  {token.trim()}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-graphite">
            Logit sharpness
            <input
              className="mt-2 w-full accent-teal-700"
              max="3"
              min="0.2"
              onChange={(event) => setSharpness(Number(event.target.value))}
              step="0.1"
              type="range"
              value={sharpness}
            />
          </label>
          <label className="block text-sm font-medium text-graphite">
            Technical-domain bias
            <input
              className="mt-2 w-full accent-teal-700"
              max="1.2"
              min="-0.5"
              onChange={(event) => setDomainBias(Number(event.target.value))}
              step="0.1"
              type="range"
              value={domainBias}
            />
          </label>
        </div>

        <div className="space-y-3 rounded-md border border-line bg-wash p-3">
          {candidates.map((token, index) => (
            <button
              className={`block w-full rounded-md border p-2 text-left ${
                index === targetIndex ? "border-teal-500 bg-teal-50" : "border-line bg-white"
              }`}
              key={token}
              onClick={() => setTargetIndex(index)}
              title="The correct label is the observed next token. Loss punishes low probability on this token."
              type="button"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-mono text-ink">{token}</span>
                <span className="font-semibold text-graphite">
                  {(probabilities[index] * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded bg-line">
                <div
                  className="h-2 rounded bg-teal-500"
                  style={{ width: `${probabilities[index] * 100}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
