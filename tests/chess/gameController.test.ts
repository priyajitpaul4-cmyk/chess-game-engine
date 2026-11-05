import { describe, it, expect } from 'vitest';
import { GameController } from '../../src/game/GameController';

describe('GameController', () => {
  it('rejects illegal moves without throwing', () => {
    expect(new GameController().move('e2', 'e5')).toBeNull();
  });
  it('detects fool\'s mate', () => {
    const g = new GameController();
    (['f2f3', 'e7e5', 'g2g4', 'd8h4'] as const).forEach(m => g.move(m.slice(0, 2) as any, m.slice(2) as any));
    expect(g.status().over).toBe(true);
    expect(g.status().text).toMatch(/Checkmate/);
  });
  it('detects stalemate', () => {
    const g = new GameController();
    expect(g.loadFen('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1')).toBe(true);
    expect(g.status().text).toMatch(/stalemate/);
  });
  it('supports castling, en passant and promotion', () => {
    const g = new GameController();
    g.loadFen('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    expect(g.move('e1', 'g1')?.san).toBe('O-O');
    g.loadFen('4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');
    expect(g.move('e5', 'd6')?.flags).toContain('e');
    g.loadFen('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');
    expect(g.move('a7', 'a8', 'q')?.promotion).toBe('q');
  });
  it('rejects invalid FEN and PGN', () => {
    const g = new GameController();
    expect(g.loadFen('garbage')).toBe(false);
    expect(g.loadPgn('1. e4 e4 zzz')).toBe(false);
  });
  it('undo/redo round-trips', () => {
    const g = new GameController(); g.move('e2', 'e4'); g.undo();
    expect(g.canRedo()).toBe(true); g.redo(); expect(g.history()).toHaveLength(1);
  });
});
