import { ChessPosition } from "./chessgame.js";
import {
  FileRank2Square,
  SquareStr2Square,
  Square2SquareStr,
  oppositeColor,
} from "./funcs.js";
import {
  FILES_CHAR,
  RANKS_CHAR,
  PIECES,
  PieceColor,
  COLORS,
} from "./constants.js";

let chess;
let playerMoves = [];
let playerMovesEventListeners = [];

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
    .addEventListener(
      "click",
      (e) => (chess.color = oppositeColor(chess.color))
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

function movePiece(squareSrc, squareDst) {
  const img = document.getElementById(squareSrc).style.backgroundImage;
  document.getElementById(squareDst).style.backgroundImage = img;
  document.getElementById(squareSrc).style.backgroundImage = "none";
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

function playMove(index) {
  const move = playerMoves[index];
  console.log(move);
  resetSquares();
  document
    .getElementById(Square2SquareStr(move[1]))
    .removeEventListener("click", playerMovesEventListeners[index]);
  chess.move(move);
  document
    .getElementById(Square2SquareStr(move[1]))
    .addEventListener("click", setSquareActive);
  movePiece(Square2SquareStr(move[0]), Square2SquareStr(move[1]));
}

// move => [src, dest, type, index, special1, special2 ]
function setSquareActive(e) {
  const square = SquareStr2Square(e.target.id);
  const piece = chess.board[square];
  if (piece === PIECES.EMPTY) throw Error("Square is empty");
  if (PieceColor[piece] !== chess.color)
    throw Error("Piece of incorrect color");
  // remove all square markers
  resetSquares();
  // all possible squares
  playerMoves = chess.getPossibleSquares(square);
  playerMoves.map((move, index) => {
    document
      .getElementById(Square2SquareStr(move[1]))
      .removeEventListener("click", setSquareActive);
    playerMovesEventListeners[index] = (e) => playMove(index);
    document
      .getElementById(Square2SquareStr(move[1]))
      .addEventListener("click", playerMovesEventListeners[index]);
  });
  // active
  e.target.classList.add("active");
  // free
  playerMoves
    .map((move) => move[1])
    .filter((sq) => chess.board[sq] === PIECES.EMPTY)
    .map(Square2SquareStr)
    .map((sq) => document.getElementById(sq).classList.add("possible"));
  // capturable
  playerMoves
    .map((move) => move[1])
    .filter(
      (sq) => PieceColor[chess.board[sq]] === oppositeColor(PieceColor[piece])
    )
    .map(Square2SquareStr)
    .map((sq) => document.getElementById(sq).classList.add("capturable"));
}
