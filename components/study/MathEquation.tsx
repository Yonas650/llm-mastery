"use client";

import katex from "katex";
import { useMemo } from "react";

type MathEquationProps = {
  expression: string;
};

export function MathEquation({ expression }: MathEquationProps) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        displayMode: true,
        strict: false,
        throwOnError: false,
        trust: false
      }),
    [expression]
  );

  return (
    <div
      className="math-render"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
