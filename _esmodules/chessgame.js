import { importFen, Castling2Fen, EnPassant2Fen } from "./parser.js";
import { isValidSquareString, isValidPieceString } from "./validator.js";
import { FileRank2Square, SquareStr2Square } from "./funcs.js";
import {
  FILES,
  RANKS,
  PIECES_CHAR,
  PIECES,
  SQUARES,
  COLORS,
  KnightDirections,
  RookDirections,
  BishopDirections,
  KingDirections,
  PieceColor,
  PieceKnight,
  PieceRookQueen,
  PieceBishopQueen,
  PieceKing,
} from "./constants.js";

class ChessPosition {
  constructor(fen) {
    if (!fen) fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const props = importFen(fen);
    this.error = typeof props === "string" ? props : false;
    this.board = props.board;
    this.color = props.color;
    this.castlingAvailability = props.castlingAvailability;
    this.enPassantSquare = props.enPassantSquare;
    this.halfMoveClock = props.halfMoveClock;
    this.fullMoveNumber = props.fullMoveNumber;
    // sum of piece value for each player
    this.piecesValue = new Array(2).fill(0);
    // count of each piece
    this.piecesCount = new Array(13).fill(0);
    // list of each piece
    this.pieceList = new Array(14 * 10);
  }

  getField(field) {
    return "";
  }

  move(srcSquare, destSquare) {
    // empty src
    if (this.board(srcSquare) === PIECES.EMPTY)
      throw Error(`No piece on Square ${srcSquare}`);
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

  //* square and attacking color
  isSquareAttacked(sq, color) {
    if (color === COLORS.BOTH) {
      // todo handle error
      console.log("wtf");
      return;
    }

    //* pawn
    if (color === COLORS.WHITE) {
      if (
        this.board[sq - 11] === PIECES.whitePawn ||
        this.board[sq - 9] === PIECES.whitePawn
      )
        return true;
    } else {
      if (
        this.board[sq + 11] === PIECES.blackPawn ||
        this.board[sq + 9] === PIECES.blackPawn
      )
        return true;
    }

    //* knight
    for (let i = 0; i < 8; i++) {
      let piece = this.board[sq + KnightDirections[i]];
      if (
        piece !== SQUARES.OFFBOARD &&
        PieceColor[piece] === color &&
        PieceKnight[piece]
      )
        return true;
    }

    //* rook & queen
    for (let i = 0; i < 4; i++) {
      let dir = RookDirections[i];
      let t_sq = sq + dir;
      let piece = this.board[t_sq];
      while (piece !== SQUARES.OFFBOARD) {
        if (piece !== PIECES.EMPTY) {
          if (PieceRookQueen[piece] && PieceColor[piece] === color) return true;
          break;
        }
        t_sq += dir;
        piece = this.board[t_sq];
      }
    }

    //* bishop & queen
    for (let i = 0; i < 4; i++) {
      let dir = BishopDirections[i];
      let t_sq = sq + dir;
      let piece = this.board[t_sq];
      while (piece !== SQUARES.OFFBOARD) {
        if (piece !== PIECES.EMPTY) {
          if (PieceBishopQueen[piece] && PieceColor[piece] === color)
            return true;
          break;
        }
        t_sq += dir;
        piece = this.board[t_sq];
      }
    }

    //* king
    for (let i = 0; i < 8; i++) {
      let piece = this.board[sq + KingDirections[i]];
      if (
        piece !== SQUARES.OFFBOARD &&
        PieceColor[piece] === color &&
        PieceKing[piece]
      )
        return true;
    }

    return false;
  }

  printAttackedSquares() {
    console.log("\nAttacked:\n");

    for (let rank = RANKS._8; rank >= RANKS._1; rank--) {
      let line = rank + 1 + "  ";
      for (let file = FILES.A_; file <= FILES.H_; file++) {
        let sq = FileRank2Square(file, rank);
        let piece = this.isSquareAttacked(sq, this.color) ? "X" : "-";
        line += " " + piece + " ";
      }
      console.log(line);
    }
  }

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
    console.log(
      `${this.color === COLORS.WHITE ? "White" : "Black"} moves next\n`
    );
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
