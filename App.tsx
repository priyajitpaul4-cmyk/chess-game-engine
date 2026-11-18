import { useEffect, useMemo, useRef, useState } from 'react';
import type { Color, PieceSymbol, Square } from 'chess.js';
import { GameController } from '../game/GameController';
import { CLOCKS, DEFAULTS, LEVELS, loadSettings, saveSettings, type Settings } from '../game/GameSettings';
import { ChessBoard } from '../components/chess-board/ChessBoard';
import { PromotionDialog } from '../components/dialogs/PromotionDialog';
import { SettingsDialog } from '../components/dialogs/SettingsDialog';
import { MoveHistory } from '../components/moves/MoveHistory';
import { CapturedPieces } from '../components/game/CapturedPieces';
import { ChessClock } from '../components/game/ChessClock';
import { AnalysisPanel } from '../components/engine/AnalysisPanel';
import { CustomEngineAdapter } from '../adapters/CustomEngineAdapter';
import { StockfishAdapter } from '../adapters/StockfishAdapter';
import type { ChessEngine, SearchInfo } from '../adapters/EngineAdapter';
import { useChessClock } from '../hooks/useChessClock';
import { playMoveSound } from '../utils/sound';

type Mode = 'hvh' | 'white' | 'black' | 'aivai';

export function App() {
  const game = useRef(new GameController()).current;
  const engine = useRef<ChessEngine | null>(null);
  const [, tick] = useState(0);
  const refresh = () => tick(n => n + 1);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const patch = (p: Partial<Settings>) => setSettings(s => ({ ...s, ...p }));
  const [showSettings, setShowSettings] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [promo, setPromo] = useState<{ from: Square; to: Square } | null>(null);
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState<Mode>('white');
  const [thinking, setThinking] = useState(false);
  const [info, setInfo] = useState<(SearchInfo & { bestMove?: string | null }) | null>(null);
  const [clockName, setClockName] = useState('Off');
  const [paused, setPaused] = useState(false);
  const [flagged, setFlagged] = useState<Color | null>(null);
  const [gameId, setGameId] = useState(0);

  useEffect(() => { saveSettings(settings); document.documentElement.dataset.theme = settings.theme; }, [settings]);
  useEffect(() => {
    try { engine.current = settings.engine === 'stockfish' ? new StockfishAdapter() : new CustomEngineAdapter(); setMsg(''); }
    catch { engine.current = null; setMsg('Engine unavailable in this browser'); }
    return () => engine.current?.dispose();
  }, [settings.engine]);

  const status = game.status();
  const history = game.history();
  const cap = game.captured();
  const over = status.over || !!flagged;
  const legalFrom = useMemo(() => (sq: Square) => game.legalMovesFrom(sq), [game, history.length]);
  const aiTurn = !over && (mode === 'aivai' || (mode === 'white' && game.turn() === 'b') || (mode === 'black' && game.turn() === 'w'));

  const clockCfg = CLOCKS[clockName];
  const times = useChessClock(clockCfg, game.turn(), history.length, history.length > 0 && !over && !paused, gameId, setFlagged);

  useEffect(() => { if (settings.sound && history.length) playMoveSound(!!history.at(-1)?.captured); }, [history.length]);

  useEffect(() => {
    const e = engine.current;
    if (!aiTurn || !e || paused) return;
    let cancelled = false;
    const preset = LEVELS[settings.level];
    setThinking(true);
    e.setPosition(game.fen());
    e.search({ depth: settings.depth || preset.depth, timeMs: settings.timeMs || preset.timeMs, useBook: true }, i => !cancelled && setInfo(i))
      .then(r => { if (cancelled || !r.bestMove) return; game.moveUci(r.bestMove); setInfo(r); refresh(); })
      .catch(err => { if (!cancelled) setMsg(err.message); })
      .finally(() => { if (!cancelled) setThinking(false); });
    return () => { cancelled = true; setThinking(false); e.stop(); };
  }, [aiTurn, history.length, settings.level, settings.depth, settings.timeMs, settings.engine, mode, paused]);

  const onMove = (from: Square, to: Square) => {
    if (game.legalMovesFrom(from).some(m => m.to === to && m.promotion)) return setPromo({ from, to });
    game.move(from, to); setMsg(''); refresh();
  };
  const choose = (p: PieceSymbol) => { if (promo) game.move(promo.from, promo.to, p); setPromo(null); refresh(); };
  const copy = (t: string, label: string) => navigator.clipboard?.writeText(t).then(() => setMsg(`${label} copied`));
  const restart = () => { setFlagged(null); setGameId(n => n + 1); setInfo(null); setPaused(false); refresh(); };
  const importText = (kind: 'FEN' | 'PGN') => {
    const t = window.prompt(`Paste ${kind}`); if (!t) return;
    const ok = kind === 'FEN' ? game.loadFen(t) : game.loadPgn(t);
    setMsg(ok ? `${kind} loaded` : `Invalid ${kind}`); if (ok) restart(); else refresh();
  };
  const newGame = () => { game.reset(); engine.current?.newGame(); setMsg(''); restart(); };
  const statusText = thinking ? 'AI thinking…' : flagged ? `${flagged === 'w' ? 'Black' : 'White'} wins on time` : status.text;
  const name = (c: Color) => (mode === 'hvh' ? 'Player' : mode === 'aivai' || (mode === 'white') === (c === 'b') ? 'AI' : 'Player');

  return (
    <main className={'app' + (settings.animations ? '' : ' no-anim')}>
      <header><h1>♞ Chess<span>Engine</span></h1><button onClick={() => setShowSettings(true)} aria-label="Open settings">⚙ Settings</button></header>
      <section className="layout">
        <aside className="panel">
          <h2>Game</h2>
          <ChessClock label={`Black · ${name('b')}`} ms={clockCfg ? times.b : 0} active={!!clockCfg && game.turn() === 'b' && !over} />
          <ChessClock label={`White · ${name('w')}`} ms={clockCfg ? times.w : 0} active={!!clockCfg && game.turn() === 'w' && !over} />
          <p className={'status' + (over ? ' over' : '')} aria-live="polite">{statusText}</p>
          <p className="muted">Move {Math.floor(history.length / 2) + 1}</p>
          <label>Mode<select value={mode} onChange={e => { const m = e.target.value as Mode; setMode(m); setFlipped(m === 'black'); }}>
            <option value="hvh">Human vs Human</option><option value="white">Play White vs AI</option>
            <option value="black">Play Black vs AI</option><option value="aivai">AI vs AI</option></select></label>
          <label>Difficulty<select value={settings.level} onChange={e => patch({ level: e.target.value })}>
            {Object.keys(LEVELS).map(l => <option key={l}>{l}</option>)}</select></label>
          <label>Clock<select value={clockName} onChange={e => { setClockName(e.target.value); setPaused(false); }}>
            {Object.keys(CLOCKS).map(c => <option key={c}>{c}</option>)}</select></label>
          <h3>Captured</h3>
          <CapturedPieces pieces={cap.w} color="b" />
          <CapturedPieces pieces={cap.b} color="w" />
        </aside>
        <div className="board-wrap">
          <ChessBoard board={game.board()} flipped={flipped} lastMove={history.at(-1)}
            className={[!settings.coordinates && 'no-coords', !settings.hints && 'no-hints', !settings.lastMove && 'no-last'].filter(Boolean).join(' ')}
            checkSquare={game.kingInCheckSquare()} disabled={over || !!promo || aiTurn || paused}
            legalFrom={legalFrom} onMove={onMove} />
        </div>
        <div className="side">
          <AnalysisPanel info={info} thinking={thinking} engine={settings.engine === 'stockfish' ? 'Stockfish' : 'Custom Engine'} />
          <aside className="panel"><h2>Moves</h2><MoveHistory moves={history} /></aside>
        </div>
      </section>
      <nav className="controls" aria-label="Game controls">
        <button disabled={!game.canUndo()} onClick={() => { game.undo(); setFlagged(null); refresh(); }}>Undo</button>
        <button disabled={!game.canRedo()} onClick={() => { game.redo(); refresh(); }}>Redo</button>
        <button onClick={newGame}>New game</button>
        <button onClick={() => setFlipped(f => !f)}>Flip</button>
        {clockCfg && <button onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button>}
        <button onClick={() => copy(game.fen(), 'FEN')}>Copy FEN</button>
        <button onClick={() => copy(game.pgn(), 'PGN')}>Copy PGN</button>
        <button onClick={() => importText('FEN')}>Load FEN</button>
        <button onClick={() => importText('PGN')}>Load PGN</button>
        <button onClick={() => { setSettings(DEFAULTS); }}>Reset settings</button>
        <span className={/unavailable|failed|Invalid/.test(msg) ? "error" : "muted"} role={/unavailable|failed|Invalid/.test(msg) ? "alert" : "status"}>{msg}</span>
      </nav>
      {promo && <PromotionDialog color={game.turn()} onPick={choose} />}
      {showSettings && <SettingsDialog s={settings} patch={patch} onClose={() => setShowSettings(false)} />}
    </main>
  );
}
