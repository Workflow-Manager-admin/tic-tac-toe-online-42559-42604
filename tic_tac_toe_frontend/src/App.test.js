import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders game title and scoreboard", () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/Player 1/i)).toBeInTheDocument();
  expect(screen.getByText(/Draws/i)).toBeInTheDocument();
});

test("allows mode switch and restart", () => {
  render(<App />);
  const modeBtn = screen.getByText(/Vs Computer/i);
  fireEvent.click(modeBtn);
  expect(modeBtn).toHaveClass("selected");
  fireEvent.click(screen.getByText(/Restart Game/i));
  expect(screen.getByText(/Player 1's turn/i)).toBeInTheDocument();
});

test("can play one move", () => {
  render(<App />);
  const squares = screen.getAllByRole("button", { name: /empty/i });
  fireEvent.click(squares[0]);
  expect(squares[0]).toHaveTextContent("X");
});
