"use client";

import { useState } from "react";

const stages = [
  {
    name: "Pretraining",
    input: "Massive token mixture",
    output: "Base model",
    detail:
      "Optimizes next-token likelihood over broad corpora. Produces continuation capability, not instruction alignment."
  },
  {
    name: "SFT",
    input: "Curated demonstrations",
    output: "Instruction behavior",
    detail:
      "Imitates target response formats and task behavior using supervised assistant examples."
  },
  {
    name: "RLHF / DPO / GRPO",
    input: "Preferences or rewards",
    output: "Preferred behavior",
    detail:
      "Shifts relative likelihood toward outputs that satisfy preference, reward, or verifier criteria."
  },
  {
    name: "RAG",
    input: "External evidence",
    output: "Grounded answer",
    detail:
      "Changes inference context with retrieved evidence rather than changing base parameters."
  }
];

export function PipelineDiagram() {
  const [active, setActive] = useState(0);
  const [showSignals, setShowSignals] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">Lifecycle comparison</h3>
          <p className="text-sm text-muted">Click a stage to inspect where supervision enters.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-graphite">
          <input
            checked={showSignals}
            className="h-4 w-4 accent-teal-700"
            onChange={(event) => setShowSignals(event.target.checked)}
            type="checkbox"
          />
          signals
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {stages.map((stage, index) => (
          <button
            className={`rounded-md border p-3 text-left transition ${
              active === index
                ? "border-teal-500 bg-teal-50"
                : "border-line bg-white hover:border-teal-500"
            }`}
            key={stage.name}
            onClick={() => setActive(index)}
            title={stage.detail}
            type="button"
          >
            <p className="text-sm font-semibold text-ink">{stage.name}</p>
            {showSignals ? (
              <div className="mt-3 space-y-2 text-xs leading-5 text-muted">
                <p>
                  <span className="font-semibold text-graphite">In:</span> {stage.input}
                </p>
                <p>
                  <span className="font-semibold text-graphite">Out:</span> {stage.output}
                </p>
              </div>
            ) : null}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-line bg-wash p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Active stage
        </p>
        <h4 className="mt-1 text-lg font-semibold text-ink">{stages[active].name}</h4>
        <p className="mt-2 text-sm leading-6 text-graphite">{stages[active].detail}</p>
      </div>
    </div>
  );
}
