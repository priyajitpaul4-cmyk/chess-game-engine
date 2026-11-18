import { memo, useState } from 'react';
import type { Move, PieceSymbol, Square } from 'chess.js';

const GLYPH: Record<string, string> = {
  wk: '♔', wq: '♕', wr: '♖', wb: '♗', wn: '♘', wp: '♙',
  bk: '♚', bq: '♛', br: '♜', bb: '♝', bn: '♞', bp: '♟',
};
export const glyph = (color: string, type: PieceSymbol) => GLYPH[color + type];

interface Props {
  board: ReturnType<import('chess.js').Chess['board']>;
  flipped: boolean;
  lastMove?: Move;
  checkSquare: Square | null;
  disabled: boolean;
  className?: string;
  legalFrom: (sq: Square) => Move[];
  onMove: (from: Square, to: Square) => void;
}

export const ChessBoard = memo(function ChessBoard(p: Props) {
  const [sel, setSel] = useState<Square | null>(null);
  const [targets, setTargets] = useState<Move[]>([]);

  const select = (sq: Square | null) => { setSel(sq); setTargets(sq ? p.legalFrom(sq) : []); };
  const click = (sq: Square, hasOwn: boolean) => {
    if (p.disabled) return;
    if (sel && targets.some(m => m.to === sq)) { p.onMove(sel, sq); select(null); }
    else if (hasOwn) select(sq === sel ? null : sq);
    else select(null);
  };

  const rows = p.flipped ? [...p.board].reverse() : p.board;
  return (
    <div className={`board ${p.className ?? ''}`} role="grid" aria-label="Chess board">
      {rows.map((row, ri) => (p.flipped ? [...row].reverse() : row).map((cell, ci) => {
        const file = p.flipped ? 7 - ci : ci, rank = p.flipped ? ri : 7 - ri;
        const sq = ('abcdefgh'[file] + (rank + 1)) as Square;
        const piece = cell;
        const t = targets.find(m => m.to === sq);
        const cls = ['sq', (file + rank) % 2 ? 'light' : 'dark',
          sel === sq && 'sel', p.lastMove && (p.lastMove.from === sq || p.lastMove.to === sq) && 'last',
          p.checkSquare === sq && 'check'].filter(Boolean).join(' ');
        const own = !!piece && p.legalFrom(sq).length > 0;
        return (
          <div key={sq} className={cls} role="gridcell" tabIndex={0}
            aria-label={`${sq}${piece ? ' ' + piece.color + piece.type : ''}`}
            onClick={() => click(sq, own)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && click(sq, own)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { const f = e.dataTransfer.getData('text') as Square;
              if (f && p.legalFrom(f).some(m => m.to === sq)) { p.onMove(f, sq); select(null); } }}>
            {ci === 0 && <span className="coord r">{rank + 1}</span>}
            {ri === 7 && <span className="coord f">{'abcdefgh'[file]}</span>}
            {t && <span className={t.captured ? 'hint cap' : 'hint'} />}
            {piece && <span className={`piece ${piece.color}`} draggable={!p.disabled && own}
              onDragStart={e => { e.dataTransfer.setData('text', sq); select(sq); }}>
              {glyph(piece.color, piece.type)}</span>}
          </div>
        );
      }))}
    </div>
  );
});
