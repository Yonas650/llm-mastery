"use client";

import { useState } from "react";

const steps = [
  {
    name: "Load batch",
    detail: "Packed token blocks enter the device with labels shifted by one position."
  },
  {
    name: "Forward",
    detail: "The model emits logits for every token position under a causal mask."
  },
  {
    name: "Loss",
    detail: "Cross-entropy averages negative log probability over valid next-token labels."
  },
  {
    name: "Backward",
    detail: "Gradients propagate through parameters, or accumulate across microbatches."
  },
  {
    name: "Optimize",
    detail: "Adam-style updates apply learning-rate schedule, moments, and clipping."
  },
  {
    name: "Checkpoint/eval",
    detail: "Metrics and recoverable state are written on cadence."
  }
];

export function TrainingStepVisualizer() {
  const [active, setActive] = useState(0);
  const [accumulation, setAccumulation] = useState(4);
  const [microbatch, setMicrobatch] = useState(2);
  const [replicas, setReplicas] = useState(16);
  const globalBatch = accumulation * microbatch * replicas;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Training loop stepper</h3>
          <p className="text-sm text-muted">Advance through one optimizer step.</p>
        </div>
        <button
          className="control-button"
          onClick={() => setActive((current) => (current + 1) % steps.length)}
          type="button"
        >
          Next step
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-6">
        {steps.map((step, index) => (
          <button
            className={`rounded-md border p-3 text-left transition ${
              index === active
                ? "border-teal-500 bg-teal-50"
                : index < active
                  ? "border-teal-100 bg-white"
                  : "border-line bg-white"
            }`}
            key={step.name}
            onClick={() => setActive(index)}
            title={step.detail}
            type="button"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{step.name}</p>
          </button>
        ))}
      </div>

      <div className="rounded-md border border-line bg-wash p-4">
        <h4 className="text-lg font-semibold text-ink">{steps[active].name}</h4>
        <p className="mt-2 text-sm leading-6 text-graphite">{steps[active].detail}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <label className="rounded-md border border-line bg-white p-3 text-sm font-medium text-graphite">
          Microbatch/GPU
          <input
            className="mt-2 w-full accent-teal-700"
            max="8"
            min="1"
            onChange={(event) => setMicrobatch(Number(event.target.value))}
            type="range"
            value={microbatch}
          />
          <span className="text-xs text-muted">{microbatch}</span>
        </label>
        <label className="rounded-md border border-line bg-white p-3 text-sm font-medium text-graphite">
          Accumulation
          <input
            className="mt-2 w-full accent-teal-700"
            max="16"
            min="1"
            onChange={(event) => setAccumulation(Number(event.target.value))}
            type="range"
            value={accumulation}
          />
          <span className="text-xs text-muted">{accumulation}</span>
        </label>
        <label className="rounded-md border border-line bg-white p-3 text-sm font-medium text-graphite">
          Replicas
          <input
            className="mt-2 w-full accent-teal-700"
            max="64"
            min="1"
            onChange={(event) => setReplicas(Number(event.target.value))}
            type="range"
            value={replicas}
          />
          <span className="text-xs text-muted">{replicas}</span>
        </label>
        <div className="rounded-md border border-line bg-white p-3">
          <p className="metric-label">global sequences</p>
          <p className="mt-2 text-lg font-semibold text-ink">{globalBatch}</p>
        </div>
      </div>
    </div>
  );
}
