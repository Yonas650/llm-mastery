"use client";

import { CheckCircle2 } from "lucide-react";
import { markDrillSolved } from "@/lib/storage";
import type { PracticeDrill, StudyState } from "@/types";

type PracticeDrillsProps = {
  drills: PracticeDrill[];
  state: StudyState;
  updateState: (updater: (current: StudyState) => StudyState) => void;
};

export function PracticeDrills({ drills, state, updateState }: PracticeDrillsProps) {
  return (
    <section className="space-y-3" id="practice-drills">
      {drills.map((drill) => {
        const solved = Boolean(state.drillProgress[drill.id]?.solved);
        return (
          <article className="panel panel-pad" key={drill.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-title">Practice Drill</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{drill.title}</h3>
              </div>
              {solved ? (
                <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                  solved
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-graphite">{drill.prompt}</p>
            <details className="mt-4 rounded-md border border-line bg-wash p-3 text-sm leading-6 text-graphite">
              <summary className="cursor-pointer font-semibold text-ink">Expected answer</summary>
              <p className="mt-2">{drill.expected}</p>
            </details>
            <button
              className="mt-4 primary-button"
              onClick={() => updateState((current) => markDrillSolved(current, drill.id))}
              type="button"
            >
              <CheckCircle2 size={16} />
              Mark solved
            </button>
          </article>
        );
      })}
    </section>
  );
}
