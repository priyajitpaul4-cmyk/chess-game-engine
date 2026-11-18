import type { Move } from 'chess.js';
export function MoveHistory({ moves }: { moves: Move[] }) {
  const rows: string[][] = [];
  moves.forEach((m, i) => { if (i % 2 === 0) rows.push([m.san]); else rows[rows.length - 1].push(m.san); });
  return (
    <ol className="moves" aria-label="Move history">
      {rows.length === 0 && <li className="muted">No moves yet</li>}
      {rows.map((r, i) => <li key={i}><b>{i + 1}.</b> {r[0]} {r[1] ?? ''}</li>)}
    </ol>
  );
}
