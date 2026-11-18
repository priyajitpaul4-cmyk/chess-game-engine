# Changelog

## 1.0.0
- Board UI: click/drag/keyboard moves, legal-move hints, last-move and check highlight, promotion dialog, flip.
- Rules via chess.js: castling, en passant, promotion, check/mate/stalemate, threefold, 50-move, insufficient material; undo/redo; FEN/PGN import and export.
- Custom engine in a Web Worker: negamax, alpha-beta, iterative deepening, quiescence, transposition table, killer/history/MVV-LVA ordering, check extension, small opening book.
- Evaluation: material, piece-square, pawn structure, bishop pair, development, rook files, king shield.
- Modes, difficulty levels, clocks with increment, settings (persisted), analysis panel, themes, sound.
- Stockfish.js UCI adapter (experimental; requires a user-supplied stockfish.js).
- Tests, lint config, CI and GitHub Pages deploy workflows.
