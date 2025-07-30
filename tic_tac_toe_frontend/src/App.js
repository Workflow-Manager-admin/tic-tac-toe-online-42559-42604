import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color palette and globals
 */
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FFD600",
};

/**
 * Board size (classic 3x3 tic tac toe)
 */
const BOARD_SIZE = 3;

/**
 * Winning line combinations
 */
const WIN_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Basic random AI move selection: picks a random empty cell.
 * @param {Array} board
 * @returns {number|null}
 */
function getRandomAIMove(board) {
  const emptyIndices = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((idx) => idx !== null);
  if (emptyIndices.length === 0) return null;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

/**
 * Checks for game winner or draw.
 * @param {Array} board
 * @returns {{winner: string|null, line: Array|null, draw: boolean}}
 */
function calculateWinner(board) {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { winner: board[a], line: [a, b, c], draw: false };
    }
  }
  const draw = board.every((cell) => cell);
  return { winner: null, line: null, draw };
}

/**
 * Square component for each cell of the tic tac toe grid.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className="ttt-square"
      style={{
        color:
          value === "X"
            ? COLORS.primary
            : value === "O"
            ? COLORS.secondary
            : undefined,
        borderColor: highlight ? COLORS.accent : "#e0e0e0",
        background: highlight ? "#FFF9C4" : "#fff",
        transition: "background 0.3s",
      }}
      onClick={onClick}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
      disabled={Boolean(value)}
      tabIndex={value ? -1 : 0}
    >
      {value}
    </button>
  );
}

/**
 * The main game board grid.
 */
function Board({ board, onCellClick, winLine }) {
  return (
    <div className="ttt-board">
      {board.map((val, idx) => (
        <Square
          key={idx}
          value={val}
          onClick={() => onCellClick(idx)}
          highlight={winLine && winLine.includes(idx)}
        />
      ))}
    </div>
  );
}

/**
 * Game mode selector
 */
function ModeSelector({ mode, setMode, gameActive }) {
  return (
    <div className="mode-selector">
      <button
        className={`mode-btn${mode === "pvp" ? " selected" : ""}`}
        style={{
          background: mode === "pvp" ? COLORS.primary : "#fff",
          color: mode === "pvp" ? "#fff" : COLORS.primary,
          borderColor: COLORS.primary,
        }}
        disabled={gameActive}
        onClick={() => setMode("pvp")}
      >
        👥 2 Players
      </button>
      <button
        className={`mode-btn${mode === "pvc" ? " selected" : ""}`}
        style={{
          background: mode === "pvc" ? COLORS.secondary : "#fff",
          color: mode === "pvc" ? "#fff" : COLORS.secondary,
          borderColor: COLORS.secondary,
        }}
        disabled={gameActive}
        onClick={() => setMode("pvc")}
      >
        🤖 Vs Computer
      </button>
    </div>
  );
}

/**
 * Status display above board.
 */
function StatusBar({ status, winner, current, draw }) {
  let info;
  if (winner) info = `Winner: ${winner === "X" ? "Player 1" : "Player 2/AI"}`;
  else if (draw) info = "It's a draw!";
  else if (current === "X") info = "Player 1's turn";
  else info = "Player 2's turn";
  return (
    <div className="status-bar">
      {status ? <span>{status}</span> : <span>{info}</span>}
    </div>
  );
}

/**
 * Control buttons: restart, reset
 */
function Controls({ onRestart, onReset, disableRestart }) {
  return (
    <div className="controls">
      <button
        className="ctrl-btn"
        style={{
          background: COLORS.primary,
          color: "#fff",
          borderColor: COLORS.primary,
        }}
        onClick={onRestart}
        disabled={disableRestart}
      >
        🔄 Restart Game
      </button>
      <button
        className="ctrl-btn"
        style={{
          background: "#fff",
          color: COLORS.secondary,
          borderColor: COLORS.secondary,
          marginLeft: "1em",
        }}
        onClick={onReset}
      >
        🧹 Reset All
      </button>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Main App component: Handles the overall game state and logic
 */
function App() {
  // "pvp" = Player vs Player, "pvc" = Player vs Computer (AI)
  const [mode, setMode] = useState("pvp");
  // "X" is always Player 1; "O" is Player 2 or Computer
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState("X");
  const [status, setStatus] = useState("");
  const [winLine, setWinLine] = useState(null);
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);
  // For tracking scores (persistent scores per session)
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  // For responsive and centering
  useEffect(() => {
    document.body.style.backgroundColor = "#f5f8fe";
  }, []);

  // Handle a cell click/play
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (board[idx] || winner || draw) return;
    const nextBoard = board.slice();
    nextBoard[idx] = current;
    const { winner: checkWin, line, draw: isDraw } = calculateWinner(
      nextBoard
    );
    setBoard(nextBoard);
    setCurrent((prev) => (prev === "X" ? "O" : "X"));
    setWinLine(line);
    setWinner(checkWin);
    setDraw(isDraw && !checkWin);

    // Update status and scores
    if (checkWin) {
      setStatus(
        checkWin === "X"
          ? mode === "pvc"
            ? "You win! 🏆"
            : "Player 1 wins! 🏆"
          : mode === "pvc"
          ? "Computer wins! 🤖"
          : "Player 2 wins! 🏆"
      );
      setScores((prev) => ({
        ...prev,
        [checkWin]: prev[checkWin] + 1,
      }));
    } else if (isDraw) {
      setStatus("It's a draw!");
      setScores((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));
    } else {
      setStatus("");
    }
  }

  // AI move for PvC mode. Only trigger after player X makes a move.
  useEffect(() => {
    if (
      mode === "pvc" &&
      current === "O" &&
      !winner &&
      !draw
    ) {
      const timer = setTimeout(() => {
        const aiMove = getRandomAIMove(board);
        if (aiMove !== null) handleCellClick(aiMove);
      }, 500); // Simulate AI's "thinking"
      return () => clearTimeout(timer);
      // eslint-disable-next-line
    }
    // eslint-disable-next-line
  }, [current, mode, winner, draw, board]);

  // PUBLIC_INTERFACE
  function handleRestart() {
    setBoard(Array(9).fill(null));
    setCurrent("X");
    setStatus("");
    setWinLine(null);
    setWinner(null);
    setDraw(false);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    handleRestart();
    setScores({ X: 0, O: 0, draws: 0 });
  }

  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    if (mode !== newMode) {
      setMode(newMode);
      handleReset();
    }
  }

  // For accessibility, keyboard navigation to make a move.
  function handleBoardKeyDown(e, idx) {
    if (!board[idx] && !winner && !draw && (e.key === "Enter" || e.key === " ")) {
      handleCellClick(idx);
    }
  }

  return (
    <div className="tic-tac-toe-app">
      <header className="ttt-header" style={{ background: COLORS.primary }}>
        <h1 style={{ color: "#fff", letterSpacing: "1px" }}>Tic Tac Toe</h1>
      </header>
      <main className="ttt-main">
        <ModeSelector
          mode={mode}
          setMode={handleModeChange}
          gameActive={board.some((cell) => cell) && !winner && !draw}
        />
        <section className="ttt-status-section">
          <StatusBar
            status={status}
            winner={winner}
            current={current}
            draw={draw}
          />
          <div className="ttt-scoreboard" aria-label="Scoreboard">
            <span>
              <span style={{ color: COLORS.primary, fontWeight: 600 }}>
                Player 1
              </span>
              : {scores.X}
            </span>
            <span>
              <span
                style={{
                  color: COLORS.accent,
                  fontWeight: 600,
                  letterSpacing: "1px",
                  marginLeft: "18px",
                  marginRight: "18px",
                }}
              >
                Draws
              </span>
              : {scores.draws}
            </span>
            <span>
              <span
                style={{
                  color: COLORS.secondary,
                  fontWeight: 600,
                }}
              >
                {mode === "pvc" ? "Computer" : "Player 2"}
              </span>
              : {scores.O}
            </span>
          </div>
        </section>
        <section className="ttt-board-container">
          <Board
            board={board}
            onCellClick={(idx) => {
              if (
                (mode === "pvc" && current === "X") ||
                mode === "pvp"
              ) {
                handleCellClick(idx);
              }
            }}
            winLine={winLine}
            onKeyDown={handleBoardKeyDown}
          />
        </section>
        <section className="ttt-controls-section">
          <Controls
            onRestart={handleRestart}
            onReset={handleReset}
            disableRestart={!(winner || draw || board.some((cell) => cell))}
          />
        </section>
        <footer className="ttt-footer">
          <p>
            <span style={{ color: COLORS.primary, fontWeight: 600 }}>
              Tip:
            </span>{" "}
            Use <span style={{ fontWeight: 600 }}>Restart</span> to play again.
            <br />
            This app was built with React.{" "}
            <a
              href="https://react.dev/"
              style={{ color: COLORS.secondary, fontWeight: 500 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
