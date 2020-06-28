(function () {
  'use strict';

  //* General *//

  //chess variants with default board and figures
  const VARIANTS = {
    UNKNOWN: 0,
    DEFAULT: 1,
    CHESS960: 2,
  };

  const PIECES_CHAR = ".PNBRQKpnbrqk";

  const FILES_CHAR = "abcdefgh";

  const RANKS_CHAR = "12345678";

  // board size with border
  const BOARD_SIZE_SAFE = 120;

  // integer representation of pieces
  const PIECES = {
    EMPTY: 0,
    whitePawn: 1,
    whiteKnight: 2,
    whiteBishop: 3,
    whiteRook: 4,
    whiteQueen: 5,
    whiteKing: 6,
    blackPawn: 7,
    blackKnight: 8,
    blackBishop: 9,
    blackRook: 10,
    blackQueen: 11,
    blackKing: 12,
  };

  const FILES = {
    A_: 0,
    B_: 1,
    C_: 2,
    D_: 3,
    E_: 4,
    F_: 5,
    G_: 6,
    H_: 7,
    NONE: 8,
  };

  const RANKS = {
    _1: 0,
    _2: 1,
    _3: 2,
    _4: 3,
    _5: 4,
    _6: 5,
    _7: 6,
    _8: 7,
    NONE: 8,
  };

  const COLORS = { WHITE: 0, BLACK: 1, BOTH: 2 };

  const CASTLEBITS = { WKCA: 1, WQCA: 2, BKCA: 4, BQCA: 8 };

  // prettier-ignore
  const SQUARES = {
    A1: 21, B1: 22, C1: 23, D1: 24, E1: 25, F1: 26, G1: 27, H1: 28,
    A8: 91, B8: 92, C8: 93, D8: 94, E8: 95, F8: 96, G8: 97, H8: 98,
    NO_SQ: 99,
    OFFBOARD: 100,
  };

  // prettier-ignore
  const PieceColor = [
    // empty
    COLORS.BOTH,
    // white
    COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE, COLORS.WHITE,
    // black
    COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK, COLORS.BLACK,
  ];

  // prettier-ignore
  const PiecePawn = [
    // empty
    false,
    // white
    true,
    false, false, false, false, false,
    // black
    true,
    false, false, false, false, false
  ];

  // prettier-ignore
  const PieceKnight = [
    // empty
    false,
    // white
    false,
    true,
    false, false, false, false,
    // black
    false,
    true,
    false, false, false, false,
  ];

  // prettier-ignore
  const PieceKing = [
    // empty
    false,
    // white
    false, false, false, false, false,
    true,
    // black
    false, false, false, false, false,
    true,
  ];

  // prettier-ignore
  const PieceRookQueen = [
    // empty
    false,
    // white
    false, false, false,
    true, true,
    false,
    // black
    false, false, false,
    true, true,
    false,
  ];

  // prettier-ignore
  const PieceBishopQueen = [
    // empty
    false,
    // white
    false, false,
    true,
    false,
    true,
    false,
    // black
    false, false,
    true,
    false,
    true,
    false,
  ];

  // Piece Directions on 120 board
  const KnightDirections = [-8, -19, -21, -12, 8, 19, 21, 12];
  const RookDirections = [-1, -10, 1, 10];
  const BishopDirections = [-9, -11, 11, 9];
  const KingDirections = [-1, -10, 1, 10, -9, -11, 11, 9];

  // prettier-ignore
  // 120 Board for easy offboard detection
  const Sq120ToSq64 = [
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65,  0,  1,  2,  3,  4,  5,  6,  7, 65,
    65,  8,  9, 10, 11, 12, 13, 14, 15, 65,
    65, 16, 17, 18, 19, 20, 21, 22, 23, 65,
    65, 24, 25, 26, 27, 28, 29, 30, 31, 65,
    65, 32, 33, 34, 35, 36, 37, 38, 39, 65,
    65, 40, 41, 42, 43, 44, 45, 46, 47, 65,
    65, 48, 49, 50, 51, 52, 53, 54, 55, 65,
    65, 56, 57, 58, 59, 60, 61, 62, 63, 65,
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
    65, 65, 65, 65, 65, 65, 65, 65, 65, 65,
  ];

  // https://regex101.com/r/ykc7s9/9
  // https://chess.stackexchange.com/questions/1482/how-to-know-when-a-fen-position-is-legal
  function isValidFen(fen, variant = VARIANTS.UNKNOWN) {
    if (typeof fen !== "string")
      throw new ValidationError("FEN must be a string");

    fen = fen.trim();

    // rough regex check
    if (
      !fen.match(
        /^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+) [bw] (-|KQ?k?q?|K?Qk?q?|K?Q?kq?|K?Q?k?q) (-|[a-h][36]) \d+ \d+$/
      )
    )
      throw new ValidationError("FEN did not pass RegEx");

    //** general format **//

    // split fen fields
    const fields = fen.split(" ");

    // 8 files
    if (fields[0].split("/").length !== 8)
      throw new ValidationError("FEN does not have 8 files");

    // sum of each row is 8
    if (
      fields[0].replace(/[1-8]/g, (str) => " ".repeat(parseInt(str, 10)))
        .length !== 71
    )
      throw new ValidationError("FEN has invalid row sum");

    // no consecutive empty numbers
    if (fields[0].match(/[1-8][1-8]/g))
      throw new ValidationError("FEN has consecutive 'empty' numbers");

    // early exit if positions can not be validated
    if (variant === VARIANTS.UNKNOWN) return true;

    return isValidBoard(variant, fields);
  }

  function isValidBoard(variant, fields) {
    if (variant !== VARIANTS.DEFAULT)
      throw new ValidationError("Chess Variant not supported");

    //* kings
    // 1 king of each color
    if (fields[0].match(/k/g).length !== 1 || fields[0].match(/K/g).length !== 1)
      throw new ValidationError("More than 1 king");

    // todo kings need to be 1 apart

    //* todo check
    /*
      Non-active color is not in check
      Active color is checked less than 3 times (triple check is impossible);
      in case of 2 that it is never pawn+(pawn, bishop, knight), bishop+bishop, knight+knight
    */

    //* pawns
    // not more than 8 pawns of each color
    if (!(fields[0].match(/p/g).length <= 8 && fields[0].match(/P/g).length <= 8))
      throw new ValidationError("More than 8 pawns");

    // no pawns in first or last rank
    if (
      fields[0].split("/")[0].match(/[pP]/) ||
      fields[0].split("/")[7].match(/[pP]/)
    )
      throw new ValidationError("Pawn in first or last rank");

    //* todo en passant
    /*
      In case of en passant square:
      see if it was legally created (e.g it must be on the x3 or x6 rank,
      there must be a pawn (from the correct color) in front of it,
      and the en passant and the one behind it are empty)
     */

    //* todo promotion
    /*
      Prevent having more promoted pieces than missing pawns
      (e.g extra_pieces = Math.max(0, num_queens-1) + Math.max(0, num_rooks-2)...
      and then extra_pieces <= (8-num_pawns)), also you should do special calculations for bishops,
      If you have two (or more) bishops from the same color,
      these can only be created through pawn promotion and you should include
      this information to the formula above somehow
    */

    //* todo pawn formation
    /*
      The pawn formation is possible to reach (e.g in case of multiple pawns in a single col,
      there must be enough enemy pieces missing to make that formation), here are some useful rules:
      1. it is impossible to have more than 6 pawns in a single file (column)
         (because pawns can't exist in the first and last ranks)
      2. the minimum number of enemy missing pieces to reach a multiple pawn in a
         single col B to G 2=1, 3=2, 4=4, 5=6, 6=9 ___ A and H 2=1, 3=3, 4=6, 5=10, 6=15,
         for example, if you see 5 pawns in A or H, the other player must be missing at least 10 pieces
         from his 15 captureable pieces
      3. if there are white pawns in a2 and a3, there can't legally be one in b2,
         and this idea can be further expanded to cover more possibilities
    */

    //* todo castling
    /*
      If the king or rooks are not in their starting position; the castling ability for that side is lost (in the case of king, both are lost)
    */

    //* todo bishops
    /*
      Look for bishops in the first and last ranks (rows) trapped by pawns that haven't moved, for example:
      1. a bishop (any color) trapped behind 3 pawns
      2. bishop trapped behind 2 non-enemy pawns (not by enemy pawns because we can reach that position by underpromoting pawns,
         however if we check the number of pawns and extra_pieces we could determine if this case is possible or not)
    */

    //* todo non-jumpers
    /*
      (Avoid this if you want to validate Fisher's Chess960) If there are non-jumpers enemy pieces in between the king and rook and
      there are still some pawns without moving; check if these enemy pieces could have legally gotten in there. Also, ask yourself:
      was the king or rook needed to move to generate that position? (if yes, we need to make sure the castling abilities reflect this)
      If all 8 pawns are still in the starting position, all the non-jumpers must not have left their initial rank (also non-jumpers enemy pieces can't possibly have entered legally),
      there are other similar ideas, like if the white h-pawn moved once, the rooks should still be trapped inside the pawn formation, etc.
    */

    //* Half/Full move Clocks
    //In case of an en passant square, the half move clock must equal to 0
    const halfMovesClock = parseInt(fields[4], 10);
    const fullMoves = parseInt(fields[5], 10);
    const blackIsNext = fields[1] === "b";
    if (fields[3] !== "-" && halfMovesClock !== 0)
      throw new ValidationError("Halfmove Clock must be 0 in case of en passant");

    //HalfMoves <= ((FullMoves-1)*2)+(if BlackToMove 1 else 0), the +1 or +0 depends on the side to move
    if (halfMovesClock > (fullMoves - 1) * 2 + (blackIsNext ? 1 : 0))
      throw new ValidationError("Invalid Halfmove Clock or Fullmoves Count");

    //The HalfMoves must be x >= 0 and the FullMoves x >= 1
    if (halfMovesClock < 0 || fullMoves < 1)
      throw new ValidationError("Invalid Halfmove Clock or Fullmoves Count");

    return true;
  }

  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "ValidationError";
    }
  }

  //* utility functions to convert different board & piece representations *//

  // 120 board index to file and rank
  function Square2FileRank(sq) {
    sq = Sq120ToSq64[sq];
    if (sq === 65) throw Error(`Invalid square ${sq}`);
    return [sq % 8, Math.floor(sq / 8)];
  }

  // file & rank to 120 board index
  function FileRank2Square(f, r) {
    if (f === FILES.NONE || r === RANKS.NONE)
      throw Error(`Invalid file ${f} or rank ${r}`);
    return 21 + f + r * 10;
  }

  // square str to 120 board index
  function SquareStr2Square(str) {
    return FileRank2Square(
      FILES[`${str.charAt(0).toUpperCase()}_`],
      RANKS[`_${str.charAt(1)}`]
    );
  }

  function Square2SquareStr(sq) {
    const fr = Square2FileRank(sq);
    return `${FILES_CHAR[fr[0]]}${RANKS_CHAR[fr[1]]}`;
  }

  function Str2Piece(str) {
    switch (str) {
      case "p":
        return PIECES.blackPawn;
      case "r":
        return PIECES.blackRook;
      case "n":
        return PIECES.blackKnight;
      case "b":
        return PIECES.blackBishop;
      case "k":
        return PIECES.blackKing;
      case "q":
        return PIECES.blackQueen;
      case "P":
        return PIECES.whitePawn;
      case "R":
        return PIECES.whiteRook;
      case "N":
        return PIECES.whiteKnight;
      case "B":
        return PIECES.whiteBishop;
      case "K":
        return PIECES.whiteKing;
      case "Q":
        return PIECES.whiteQueen;
      default:
        return PIECES.EMPTY;
    }
  }

  function oppositeColor(color) {
    if (color === COLORS.BOTH) throw Error("No opposite color for BOTH");
    return color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  }

  // todo pgn
  //https://en.wikipedia.org/wiki/Portable_Game_Notation

  // https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
  function importFen(fen) {
    try {
      isValidFen(fen.trim(), VARIANTS.UNKNOWN);
    } catch (err) {
      return err.message;
    }

    const fields = fen.split(" ");

    return {
      board: Fen2Board(fields[0]),
      color: fields[1] === "w" ? COLORS.WHITE : COLORS.BLACK,
      castlingAvailability: Fen2Castling(fields[2]),
      enPassantSquare: Fen2EnPassant(fields[3]),
      halfMoveClock: parseInt(fields[4], 10),
      fullMoveNumber: parseInt(fields[5], 10),
    };
  }

  function Fen2EnPassant(enPassant) {
    if (enPassant === "-") return 0;
    return FileRank2Square(
      FILES[`${enPassant.charAt(0).toUpperCase()}_`],
      RANKS[`_${enPassant.charAt(1)}`]
    );
  }

  function EnPassant2Fen(enPassant) {
    if (enPassant === 0) return "-";
    let arr = Square2FileRank(enPassant);
    return `${FILES_CHAR[arr[0]]}${arr[1]}`;
  }

  function Fen2Castling(castling) {
    let castlingAvailability = 0;
    castling.split("").map((val) => {
      switch (val) {
        case "K":
          castlingAvailability |= CASTLEBITS.WKCA;
          break;
        case "Q":
          castlingAvailability |= CASTLEBITS.WQCA;
          break;
        case "k":
          castlingAvailability |= CASTLEBITS.BKCA;
          break;
        case "q":
          castlingAvailability |= CASTLEBITS.BQCA;
          break;
      }
    });
    return castlingAvailability;
  }

  function Castling2Fen(castlingAvailability) {
    let str = "";
    if (castlingAvailability & CASTLEBITS.WKCA) str += "K";
    if (castlingAvailability & CASTLEBITS.WQCA) str += "Q";
    if (castlingAvailability & CASTLEBITS.BKCA) str += "k";
    if (castlingAvailability & CASTLEBITS.BQCA) str += "q";
    if (str === "") return "-";
    return str;
  }

  function Fen2Board(pieces) {
    let board = new Array(BOARD_SIZE_SAFE).fill(SQUARES.OFFBOARD);
    // Fen is starting at rank 8
    const ranks = pieces.split("/").reverse();
    ranks.map((rank, rankIndex) => {
      let digits = rank.split("");
      let fileIndex = 0;
      let charPos = 0;
      while (fileIndex <= FILES.H_) {
        let digit = parseInt(digits[charPos], 10);
        if (isNaN(digit)) {
          board[FileRank2Square(fileIndex, rankIndex)] = Str2Piece(
            digits[charPos]
          );
          fileIndex++;
        } else {
          let counter = 0;
          while (counter < digit) {
            board[FileRank2Square(fileIndex + counter, rankIndex)] = PIECES.EMPTY;
            counter++;
          }
          fileIndex += digit;
        }
        charPos++;
      }
    });
    return board;
  }

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
      if (color === COLORS.BOTH) throw Error("Color must be black or white");

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
            if (PieceColor[piece] === color && PieceBishopQueen[piece])
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

    getPossibleSquares(sq) {
      const piece = this.board[sq];
      const colorOfPiece = PieceColor[piece];
      if (piece === SQUARES.OFFBOARD) throw Error("Square is offboard");
      if (piece === PIECES.EMPTY) throw Error("Square is empty");

      if (PiecePawn[piece]) {
        const moves = [10, 20, 11, 9];
        const conditions = [
          // step forward
          (move) =>
            this.board[sq + move] !== SQUARES.OFFBOARD &&
            this.board[sq + move] === PIECES.EMPTY,
          // 2 steps forward
          (move) =>
            ((colorOfPiece === COLORS.WHITE &&
              Square2FileRank(sq)[1] === RANKS._2) ||
              (colorOfPiece === COLORS.BLACK &&
                Square2FileRank(sq)[1] === RANKS._7)) &&
            this.board[sq + move / 2] === PIECES.EMPTY &&
            this.board[sq + move] === PIECES.EMPTY,
          // capture forward right
          (move) =>
            this.board[sq + move] !== SQUARES.OFFBOARD &&
            this.board[sq + move] !== PIECES.EMPTY &&
            PieceColor[this.board[sq + move]] === oppositeColor(colorOfPiece),
          // capture forward left
          (move) =>
            this.board[sq + move] !== SQUARES.OFFBOARD &&
            this.board[sq + move] !== PIECES.EMPTY &&
            PieceColor[this.board[sq + move]] === oppositeColor(colorOfPiece),
        ];
        const squares = [];
        if (PieceColor[piece] === COLORS.WHITE)
          moves.map((dir, index) => {
            if (conditions[index](dir)) squares.push(sq + dir);
          });
        else
          moves.map((dir, index) => {
            if (conditions[index](-dir)) squares.push(sq - dir);
          });
        return squares;
      }
      if (PieceKnight[piece]) {
        return KnightDirections.map((dir) => sq - dir).filter(
          (destSquare) =>
            this.board[destSquare] !== SQUARES.OFFBOARD &&
            (this.board[destSquare] === PIECES.EMPTY ||
              PieceColor[this.board[destSquare]] !== colorOfPiece)
        );
      }
      return [];
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

  let chess;

  window.onload = function () {
    loadFen(true);
    document
      .getElementById("set-fen")
      .addEventListener("click", (e) => loadFen());
    document
      .getElementById("flip-board")
      .addEventListener("click", (e) => flipBoard());
    document
      .getElementById("new-game")
      .addEventListener("click", (e) => loadFen(true));
    document.getElementById("info-expand").addEventListener("click", (e) => {
      document.getElementById("info").classList.toggle("expanded");
      document.getElementById("info-expand").classList.toggle("expanded");
    });
    document
      .getElementById("test")
      .addEventListener("click", (e) =>
        setProbabilities(getRandomInt(100) / 100)
      );
    document.querySelectorAll(".square").forEach((square) => {
      square.addEventListener("click", setSquareActive);
    });
  };

  function loadFen(loadDefault = false) {
    // ts syntax: let fen = (<HTMLInputElement>document.getElementById("fen")).value;
    let fen = loadDefault ? "" : document.getElementById("fen").value;
    document.getElementById("error").innerText = "";
    chess = new ChessPosition(fen);
    if (typeof chess.error === "string") {
      document.getElementById("error").innerText = chess.error;
      return;
    }
    removeAllPieces();
    resetSquares();
    document.getElementById("fen").value = "";
    const piecesStr = [
      "",
      "wP",
      "wN",
      "wB",
      "wR",
      "wQ",
      "wK",
      "bP",
      "bN",
      "bB",
      "bR",
      "bQ",
      "bK",
    ];
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        let pieceNum = chess.board[FileRank2Square(file, rank)];
        if (pieceNum !== 0)
          setPiece(`${FILES_CHAR[file]}${RANKS_CHAR[rank]}`, piecesStr[pieceNum]);
      }
    }
    chess.printAttackedSquares();
    chess.prettyPrint();
  }

  function setPiece(square, piece) {
    document.getElementById(
      square
    ).style.backgroundImage = `url(images/${piece}.svg)`;
  }

  function removeAllPieces() {
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        document.getElementById(
          `${FILES_CHAR[file]}${RANKS_CHAR[rank]}`
        ).style.backgroundImage = "none";
      }
    }
  }

  function resetSquares() {
    document
      .querySelectorAll(".square")
      .forEach((el) => el.classList.remove("active", "possible", "capturable"));
  }

  function flipBoard() {
    document
      .querySelectorAll("#board, #board-rows, #board-columns, .square")
      .forEach((el) => el.classList.toggle("flipped"));
  }

  function setProbabilities(whiteToWin) {
    document.getElementById("prob-white").style.width = `${whiteToWin * 30}vw`;
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function setSquareActive(e) {
    const square = SquareStr2Square(e.target.id);
    const piece = chess.board[square];
    if (piece === PIECES.EMPTY) throw Error("Square is empty");
    if (PieceColor[piece] !== chess.color)
      throw Error("Piece of incorrect color");
    // remove all square markers
    resetSquares();
    // all possible squares
    const possible = chess.getPossibleSquares(square);
    // active
    e.target.classList.add("active");
    // free
    possible
      .filter((sq) => chess.board[sq] === PIECES.EMPTY)
      .map(Square2SquareStr)
      .map((sq) => document.getElementById(sq).classList.add("possible"));
    // capturable
    possible
      .filter(
        (sq) => PieceColor[chess.board[sq]] === oppositeColor(PieceColor[piece])
      )
      .map(Square2SquareStr)
      .map((sq) => document.getElementById(sq).classList.add("capturable"));
  }

}());
