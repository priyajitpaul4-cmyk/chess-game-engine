# Search
- **Negamax + alpha-beta**: one scoring function for both sides; branches that cannot change the result are cut.
- **Iterative deepening**: depths 1..N, keeping the last completed result; stops on depth or time limit.
- **Move ordering**: TT move, MVV-LVA captures, promotions, killer moves, history heuristic.
- **Quiescence**: at depth 0 only captures/promotions are searched, with stand-pat.
- **Transposition table**: key = first four FEN fields; stores depth, score, bound (EXACT/LOWER/UPPER), best move.
- **Extras**: check extension; mate scores are `±(100000 − ply)` so faster mates win; draws (stalemate, repetition, 50-move, insufficient material) score 0.
