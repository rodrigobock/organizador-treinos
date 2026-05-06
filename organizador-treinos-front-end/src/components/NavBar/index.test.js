import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";

const mockSignout = jest.fn();
const mockToggleTheme = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

beforeEach(() => {
  useAuth.mockReturnValue({
    user: { name: "Rodrigo Bock", email: "r@email.com" },
    signout: mockSignout,
  });
  useTheme.mockReturnValue({ theme: "dark", toggleTheme: mockToggleTheme });
  mockSignout.mockClear();
  mockToggleTheme.mockClear();
  mockNavigate.mockClear();
});

test("exibe o nome do usuário", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByText("Rodrigo")).toBeInTheDocument();
});

test("exibe as iniciais do usuário no avatar", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByText("RB")).toBeInTheDocument();
});

test("botão Sair chama signout e navega para /", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  fireEvent.click(screen.getByText("Sair"));
  expect(mockSignout).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("botão de tema chama toggleTheme", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  fireEvent.click(screen.getByTitle("Mudar para Light"));
  expect(mockToggleTheme).toHaveBeenCalledTimes(1);
});

test("ícone do tema exibe sol no modo dark", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByTitle("Mudar para Light")).toBeInTheDocument();
});
