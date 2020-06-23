import { ChessPosition } from "./chessgame.js";
import { FILES_CHAR, RANKS_CHAR, FileRank2Square } from "./constants.js";

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
    .addEventListener("click", (e) => setProbabilities(getRandomInt(100)));
  document.querySelectorAll(".square").forEach((square) => {
    square.addEventListener("click", setSquareActive);
  });
  //? tests
  movePiece("a2", "a3");
};

function loadFen(loadDefault = false) {
  // ts syntax: let fen = (<HTMLInputElement>document.getElementById("fen")).value;
  let fen = loadDefault ? "" : document.getElementById("fen").value;
  document.getElementById("error").innerText = "";
  let chess = new ChessPosition(fen);
  if (typeof chess.error === "string") {
    document.getElementById("error").innerText = chess.error;
    return;
  }
  removeAllPieces();
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

function flipBoard() {
  if (document.getElementById("board").classList.contains("flipped")) {
    document
      .querySelectorAll("#board, #board-rows, #board-columns, .square")
      .forEach((el) => el.classList.remove("flipped"));
  } else {
    document
      .querySelectorAll("#board, #board-rows, #board-columns, .square")
      .forEach((el) => el.classList.add("flipped"));
  }
}

function setProbabilities(whiteToWin) {
  document.getElementById("probabilities").style.background = `linear-gradient(
  to right,
  var(--chess-light) 0%,
  var(--chess-light) ${whiteToWin}%,
  var(--chess-dark) ${whiteToWin}%,
  var(--chess-dark) 100%
  )`;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function setSquareActive(e) {
  // remove all square markers
  document.querySelectorAll(".square").forEach((el) => {
    el.classList.remove("active");
    el.classList.remove("possible");
    el.classList.remove("capturable");
  });
  //todo get possible & capturable squares
  //todo set possible & capturable classes
  const possible = [];
  const capturable = [];
  // add active, possible & capturable markers
  e.target.classList.add("active");
  possible.map((sq) => document.getElementById(sq).classList.add("possible"));
  capturable.map((sq) =>
    document.getElementById(sq).classList.add("capturable")
  );
}
