export default function ProgressBar({ current, total }) {
  const pct = total > 1 ? ((current) / (total - 1)) * 100 : 0;
  return <div className="progress-bar" style={{ width: `${pct}%` }} />;
}
