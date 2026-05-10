"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyStudyState, loadStudyState, saveStudyState } from "@/lib/storage";
import type { StudyState } from "@/types";

export function useStudyState() {
  const [state, setState] = useState<StudyState>(emptyStudyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadStudyState());
    setHydrated(true);
  }, []);

  const updateState = useCallback((updater: (current: StudyState) => StudyState) => {
    setState((current) => {
      const next = updater(current);
      saveStudyState(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      state,
      hydrated,
      updateState
    }),
    [hydrated, state, updateState]
  );
}
