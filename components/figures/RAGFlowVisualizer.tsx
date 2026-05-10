"use client";

import { useState } from "react";

const ragStages = [
  "Query rewrite",
  "Vector search",
  "Metadata filter",
  "Rerank",
  "Context pack",
  "Grounded answer"
];

export function RAGFlowVisualizer() {
  const [active, setActive] = useState(1);
  const [rerank, setRerank] = useState(true);
  const [citations, setCitations] = useState(true);
  const visibleStages = ragStages.filter((stage) => rerank || stage !== "Rerank");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">RAG flow</h3>
          <p className="text-sm text-muted">Toggle system choices and inspect failure points.</p>
        </div>
        <div className="flex flex-col gap-2 text-xs font-medium text-graphite sm:flex-row">
          <label className="flex items-center gap-2">
            <input
              checked={rerank}
              className="accent-teal-700"
              onChange={(event) => setRerank(event.target.checked)}
              type="checkbox"
            />
            rerank
          </label>
          <label className="flex items-center gap-2">
            <input
              checked={citations}
              className="accent-teal-700"
              onChange={(event) => setCitations(event.target.checked)}
              type="checkbox"
            />
            citations
          </label>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {visibleStages.map((stage, index) => (
          <button
            className={`rounded-md border p-3 text-left ${
              active === index ? "border-teal-500 bg-teal-50" : "border-line bg-white"
            }`}
            key={stage}
            onClick={() => setActive(index)}
            title="Click to inspect this RAG stage."
            type="button"
          >
            <p className="text-xs font-semibold text-muted">0{index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{stage}</p>
          </button>
        ))}
      </div>
      <div className="rounded-md border border-line bg-wash p-4 text-sm leading-6 text-graphite">
        <span className="font-semibold text-ink">{visibleStages[active]}:</span>{" "}
        {visibleStages[active] === "Grounded answer"
          ? citations
            ? "Generation must cite evidence spans and abstain when retrieved context does not support the answer."
            : "Without citation pressure, unsupported synthesis is harder to detect."
          : "Failures here propagate downstream, so evaluate retrieval and generation separately."}
      </div>
    </div>
  );
}
