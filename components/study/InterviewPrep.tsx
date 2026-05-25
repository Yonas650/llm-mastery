"use client";

import { BriefcaseBusiness, ChevronDown } from "lucide-react";
import type { InterviewQuestion } from "@/types";

type InterviewPrepProps = {
  questions?: InterviewQuestion[];
};

const difficultyLabel: Record<InterviewQuestion["difficulty"], string> = {
  core: "core",
  math: "math",
  systems: "systems",
  debugging: "debug",
  design: "design"
};

export function InterviewPrep({ questions = [] }: InterviewPrepProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="panel panel-pad" id="interview-prep">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={18} className="text-teal-700" />
            <p className="section-title">Interview Prep</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-ink">High-signal questions</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Answer out loud first. Then open the reference answer and compare mechanism,
            math, tradeoffs, and failure modes.
          </p>
        </div>
        <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
          {questions.length} Qs
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {questions.map((question, index) => (
          <details className="group rounded-md border border-line bg-wash p-3" key={question.id}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    Q{index + 1}
                  </span>
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-700">
                    {difficultyLabel[question.difficulty]}
                  </span>
                  {question.tags.map((tag) => (
                    <span
                      className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-muted"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-2 text-base font-semibold leading-7 text-ink">
                  {question.question}
                </h3>
              </div>
              <ChevronDown
                className="mt-1 shrink-0 text-muted transition group-open:rotate-180"
                size={18}
              />
            </summary>
            <div className="mt-4 border-t border-line pt-3 text-sm leading-6 text-graphite">
              {question.answer.split("\n").map((paragraph) => (
                <p className="mt-2 first:mt-0" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
