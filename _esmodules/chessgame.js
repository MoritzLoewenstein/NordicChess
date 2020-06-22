import { importFen, Castling2Fen, EnPassant2Fen } from "./parser.js";
import { isValidSquareString, isValidPieceString } from "./validator.js";
import { FILES, RANKS, PIECES_CHAR, FileRank2Square } from "./constants.js";

class ChessPosition {
  constructor(fen) {
    if (!fen) fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const props = importFen(fen);
    this.error = typeof props === "string" ? props : false;
    this.board = props.board;
    this.whiteIsNext = props.whiteIsNext;
    this.castlingAvailability = props.castlingAvailability;
    this.enPassantSquare = props.enPassantSquare;
    this.halfMoveClock = props.halfMoveClock;
    this.fullMoveNumber = props.fullMoveNumber;
    // sum of piece value for each player
    this.piecesValue = new Array(2).fill(0);
    // count of each piece
    this.piecesCount = new Array(13);
  }

  getField(field) {
    //todo get field
    return "";
  }

  moveNew(src, dest) {
    // invalid fields
    if (!isValidSquareString(src) || !isValidSquareString(dest)) return;
    // empty src
    if (this.getField(src) === "") return;
  }

  // https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
  move(mv) {
    // resign
    if (mv === "==") {
      console.log(
        this.whiteIsNext ? "0-1 White resigned" : "1-0 Black resigned"
      );
      return;
    }

    let offerDraw = false;
    // draw offer
    if (mv.endsWith("=")) {
      offerDraw = true;
      mv = mv.substring(0, mv.length - 1);
    }
    // kingside castling
    else if (mv === "0-0") this.castle(true);
    // queenside castling
    else if (mv === "0-0-0") this.castle(false);
    // pawn move, e.g. "c5"
    else if (isValidSquareString(mv)) {
      // todo move pawn
    }
    // normal move, e.g. "Bc5"
    else if (
      mv.length === 3 &&
      isValidPieceString(mv.charAt(0), this.whiteIsNext === "w") &&
      isValidSquareString(mv.slice(1))
    ) {
      // todo move figure
    }
    // normal capture, e.g. "Bxe5"
    else if (
      mv.length === 4 &&
      mv.charAt(1) === "x" &&
      isValidPieceString(mv.charAt(0), this.whiteIsNext === "w") &&
      isValidSquareString(mv.slice(2))
    ) {
    }
    // en passant capture, e.g. "exd6e.p."
    else if (mv.includes("e.p.")) {
    }
  }

  // true -> kingside, false -> queenside
  castle(side) {
    if (side) {
      if (this.whiteIsNext === "w" && this.castlingAvailability.includes("K")) {
        //todo castle kingside with white
        // todo remove castling availability
      } else if (
        this.whiteIsNext === "b" &&
        this.castlingAvailability.includes("k")
      ) {
        //todo castle kingside with black
        // todo remove castling availability
      }
    } else {
      if (this.whiteIsNext === "w" && this.castlingAvailability.includes("Q")) {
        //todo castle queenside with white
        // todo remove castling availability
      } else if (
        this.whiteIsNext === "b" &&
        this.castlingAvailability.includes("q")
      ) {
        //todo castle queenside with black
        // todo remove castling availability
      }
    }
  }

  isGameOver() {
    return this.isCheckmate() || this.isRemis();
  }

  isCheckmate() {
    // check checkmate
    // todo check if under threat
    //todo check all surrounding fields
    // todo if he can capture is victim covered?
    return false;
  }

  isRemis() {
    // check remis
    return false;
  }

  generatePositionTree(depth) {}

  evaluate() {}

  prettyPrint() {
    console.log("\nGame Board:\n");
    for (let rank = RANKS._8; rank >= RANKS._1; rank--) {
      let line = `${rank + 1}  `;
      for (let file = FILES.A_; file <= FILES.H_; file++) {
        let sq = FileRank2Square(file, rank);
        let piece = this.board[sq];
        line += " " + PIECES_CHAR[piece] + " ";
      }
      console.log(line);
    }
    console.log("\n    a  b  c  d  e  f  g  h\n");
    console.log(this.whiteIsNext ? "White moves next\n" : "Black moves next\n");
    console.log(`Castling: ${Castling2Fen(this.castlingAvailability)}\n`);
    console.log(`En Passant Square: ${EnPassant2Fen(this.enPassantSquare)} \n`);
    console.log(`halfMoveClock: ${this.halfMoveClock}\n`);
    console.log(`fullMoveNumber: ${this.fullMoveNumber}\n`);
  }
}

// minimax algorith with alpha-beta pruning
// initial call: minimax(position, n, -Infinity, +Infinity, true)
function minimax(position, depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || position.isGameOver()) return position.evaluate();

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    // loop through children
    for (let pos of position.children) {
      const ev = minimax(pos, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) {
        break;
      }
    }
    return maxEval;
  } else {
    let minEval = +Infinity;
    for (let pos of position.children) {
      const ev = minimax(pos, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) {
        break;
      }
    }
    return minEval;
  }
}

export { ChessPosition };
