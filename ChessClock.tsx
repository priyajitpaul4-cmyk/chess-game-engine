const fmt = (ms: number) => ms < 10000 ? (ms / 1000).toFixed(1)
  : `${Math.floor(Math.ceil(ms / 1000) / 60)}:${String(Math.ceil(ms / 1000) % 60).padStart(2, '0')}`;
export function ChessClock({ label, ms, active }: { label: string; ms: number; active: boolean }) {
  return (
    <div className={'clock' + (active ? ' active' : '') + (ms < 10000 ? ' low' : '')} aria-label={`${label} clock`}>
      <span>{label}</span><b>{fmt(ms)}</b>
    </div>
  );
}
