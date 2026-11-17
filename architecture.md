# Architecture
UI (React) → `GameController` (rules via chess.js) → `ChessEngine` interface → `CustomEngineAdapter` / `StockfishAdapter` → Web Worker → `Searcher` → `Evaluation`.
- `src/components`: presentation only. `src/game`: state, settings, rules. `src/adapters`: engine boundary. `src/workers`: UCI-style command loop. `src/engine`: search, evaluation, book — no React imports.
- Moves cross the boundary in UCI notation (`e2e4`); principal variations are displayed in SAN. Scores are centipawns from White's view.
