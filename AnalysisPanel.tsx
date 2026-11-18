import type { SearchInfo } from '../../adapters/EngineAdapter';

export function formatScore(cp: number): string {
  if (Math.abs(cp) > 99000) return `${cp > 0 ? '+' : '-'}M${Math.ceil((100000 - Math.abs(cp)) / 2)}`;
  return `${cp >= 0 ? '+' : ''}${(cp / 100).toFixed(2)}`;
}
export function AnalysisPanel({ info, thinking, engine }: { info: (SearchInfo & { bestMove?: string | null }) | null; thinking: boolean; engine: string }) {
  return (
    <section className="panel analysis" aria-label="Engine analysis">
      <h2>Analysis</h2>
      <p className="muted">{engine}{thinking ? ' · AI thinking…' : ''}</p>
      {info ? (
        <dl>
          <dt>Evaluation</dt><dd>{formatScore(info.score)}</dd>
          <dt>Depth</dt><dd>{info.depth}</dd>
          <dt>Nodes</dt><dd>{info.nodes.toLocaleString()}</dd>
          <dt>Time</dt><dd>{(info.timeMs / 1000).toFixed(2)}s</dd>
          {info.bestMove && <><dt>Best move</dt><dd>{info.bestMove}</dd></>}
          <dt>Line</dt><dd>{info.pv.join(' ')}</dd>
        </dl>
      ) : <p className="muted">No analysis yet</p>}
    </section>
  );
}
