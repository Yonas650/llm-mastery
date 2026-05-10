type MetricBadgeProps = {
  label: string;
  value: string;
};

export function MetricBadge({ label, value }: MetricBadgeProps) {
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2">
      <p className="metric-label">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}
