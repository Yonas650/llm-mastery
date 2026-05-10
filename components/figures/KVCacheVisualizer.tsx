"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import { MetricBadge } from "@/components/figures/MetricBadge";

type NumberSetter = Dispatch<SetStateAction<number>>;

export function KVCacheVisualizer() {
  const [layers, setLayers] = useState(32);
  const [heads, setHeads] = useState(32);
  const [headDim, setHeadDim] = useState(128);
  const [sequence, setSequence] = useState(4096);
  const [batch, setBatch] = useState(4);
  const [bytes, setBytes] = useState(2);
  const controls: Array<[string, number, number, number, NumberSetter]> = [
    ["Layers", layers, 8, 80, setLayers],
    ["Heads", heads, 8, 64, setHeads],
    ["Head dim", headDim, 64, 256, setHeadDim],
    ["Sequence", sequence, 512, 16000, setSequence],
    ["Batch", batch, 1, 32, setBatch],
    ["Bytes/value", bytes, 1, 2, setBytes]
  ];

  const memoryGb = useMemo(() => {
    const totalBytes = layers * batch * sequence * heads * headDim * 2 * bytes;
    return totalBytes / 1024 ** 3;
  }, [batch, bytes, headDim, heads, layers, sequence]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-ink">KV cache memory</h3>
        <p className="text-sm text-muted">Memory scales with layers, batch, sequence, heads, and precision.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBadge label="cache formula" value="K+V per token" />
        <MetricBadge label="precision" value={`${bytes * 8}-bit`} />
        <MetricBadge label="estimated cache" value={`${memoryGb.toFixed(2)} GB`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {controls.map(([label, value, min, max, setter]) => (
          <label
            className="rounded-md border border-line bg-white p-3 text-sm font-medium text-graphite"
            key={String(label)}
          >
            {label}: {String(value)}
            <input
              className="mt-2 w-full accent-teal-700"
              max={Number(max)}
              min={Number(min)}
              onChange={(event) =>
                setter(Number(event.target.value))
              }
              step="1"
              type="range"
              value={Number(value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
