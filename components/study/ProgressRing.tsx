type ProgressRingProps = {
  value: number;
  size?: number;
};

export function ProgressRing({ value, size = 52 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const background = `conic-gradient(#11a68a ${clamped * 3.6}deg, #e7edf2 0deg)`;

  return (
    <div
      aria-label={`${clamped}% mastery`}
      className="grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size, background }}
    >
      <div className="grid h-[78%] w-[78%] place-items-center rounded-full bg-white text-xs font-semibold text-ink">
        {clamped}%
      </div>
    </div>
  );
}
