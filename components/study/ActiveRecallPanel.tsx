"use client";

import { useState } from "react";
import { Eye, RotateCcw, Save } from "lucide-react";
import { recordMemoryAnswer, recordRecallRating } from "@/lib/storage";
import { ratingLabel, REVIEW_INTERVAL_DAYS } from "@/lib/spacedRepetition";
import type { RecallQuestion, ReviewRating, StudyState } from "@/types";

type ActiveRecallPanelProps = {
  questions: RecallQuestion[];
  state: StudyState;
  updateState: (updater: (current: StudyState) => StudyState) => void;
};

const ratings: ReviewRating[] = ["forgot", "weak", "okay", "strong", "mastered"];

function intervalLabel(rating: ReviewRating): string {
  const days = REVIEW_INTERVAL_DAYS[rating];
  if (days === 0) {
    return "today";
  }
  if (days === 1) {
    return "tomorrow";
  }
  return `${days} days`;
}

export function ActiveRecallPanel({ questions, state, updateState }: ActiveRecallPanelProps) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <section className="space-y-3" id="active-recall">
      {questions.map((question) => {
        const review = state.recallReviews[question.id];
        const savedAnswer = state.memoryAnswers[question.id];
        const draft = drafts[question.id] ?? savedAnswer?.text ?? "";
        const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;
        return (
          <article className="panel panel-pad" key={question.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="section-title">Active Recall</p>
                <h3 className="mt-2 text-lg font-semibold leading-7 text-ink">
                  {question.prompt}
                </h3>
              </div>
              {review ? (
                <span className="rounded-md bg-wash px-2 py-1 text-xs font-semibold text-muted">
                  {ratingLabel(review.rating)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 space-y-2">
              <label className="block text-sm font-semibold text-ink" htmlFor={`${question.id}-answer`}>
                Explain from memory
              </label>
              <textarea
                className="min-h-28 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 text-graphite"
                id={`${question.id}-answer`}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [question.id]: event.target.value
                  }))
                }
                placeholder="Write the answer before revealing the reference answer."
                value={draft}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted">
                  {wordCount} words
                  {savedAnswer?.updatedAt
                    ? ` · saved ${new Date(savedAnswer.updatedAt).toLocaleDateString()}`
                    : ""}
                </p>
                <button
                  className="control-button"
                  disabled={draft.trim().length === 0}
                  onClick={() =>
                    updateState((current) =>
                      recordMemoryAnswer(current, question.id, draft.trim())
                    )
                  }
                  type="button"
                >
                  <Save size={15} />
                  Save answer
                </button>
              </div>
            </div>

            {revealed[question.id] ? (
              <div className="mt-4 rounded-md border border-line bg-wash p-3 text-sm leading-6 text-graphite">
                {question.answer}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="control-button"
                onClick={() =>
                  setRevealed((current) => ({
                    ...current,
                    [question.id]: !current[question.id]
                  }))
                }
                type="button"
              >
                <Eye size={15} />
                {revealed[question.id] ? "Hide answer" : "Reveal answer"}
              </button>
              {ratings.map((rating) => (
                <button
                  className="control-button"
                  key={rating}
                  onClick={() =>
                    updateState((current) => recordRecallRating(current, question.id, rating))
                  }
                  title={`Review ${intervalLabel(rating)}`}
                  type="button"
                >
                  <RotateCcw size={15} />
                  {ratingLabel(rating)}
                </button>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}
