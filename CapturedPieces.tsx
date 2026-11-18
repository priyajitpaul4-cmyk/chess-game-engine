import type { Color, PieceSymbol } from 'chess.js';
import { glyph } from '../chess-board/ChessBoard';
export function CapturedPieces({ pieces, color }: { pieces: PieceSymbol[]; color: Color }) {
  return <div className="captured" aria-label="Captured pieces">{pieces.map((t, i) => <span key={i}>{glyph(color, t)}</span>)}</div>;
}
