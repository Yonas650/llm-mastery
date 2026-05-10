"use client";

import { BookOpen, Brain, CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import { updateTopicStage } from "@/lib/storage";
import type { StudyStage, StudyState } from "@/types";

const stages: Array<{
  id: StudyStage;
  label: string;
  icon: typeof BookOpen;
}> = [
  { id: "learn", label: "Learn", icon: BookOpen },
  { id: "explain", label: "Explain", icon: Brain },
  { id: "check", label: "Check", icon: CheckCircle2 },
  { id: "drill", label: "Drill", icon: ClipboardCheck },
  { id: "review", label: "Review", icon: RotateCcw }
];

type StudyFlowControlsProps = {
  slug: string;
  currentStage: StudyStage;
  updateState: (updater: (current: StudyState) => StudyState) => void;
};

export function StudyFlowControls({
  currentStage,
  slug,
  updateState
}: StudyFlowControlsProps) {
  return (
    <div className="grid grid-cols-5 gap-1 rounded-lg border border-line bg-white p-1">
      {stages.map((stage) => {
        const Icon = stage.icon;
        const active = currentStage === stage.id;
        return (
          <button
            className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold transition sm:min-h-11 sm:flex-row sm:text-sm ${
              active ? "bg-ink text-white" : "text-muted hover:bg-wash hover:text-ink"
            }`}
            key={stage.id}
            onClick={() => updateState((current) => updateTopicStage(current, slug, stage.id))}
            title={stage.label}
            type="button"
          >
            <Icon size={16} />
            <span>{stage.label}</span>
          </button>
        );
      })}
    </div>
  );
}
