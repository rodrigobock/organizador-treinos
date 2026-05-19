import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");
jest.mock("../../contexts/language");

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import { useLanguage } from "../../contexts/language";

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
  useLanguage.mockReturnValue({ language: "pt-BR", setLanguage: jest.fn() });
  mockSignout.mockClear();
  mockToggleTheme.mockClear();
  mockNavigate.mockClear();
});

test("exibe o nome do usuario", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByText("Rodrigo")).toBeInTheDocument();
});

test("exibe as iniciais do usuario no avatar", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByText("RB")).toBeInTheDocument();
});

test("botao Sair chama signout e navega para /", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  fireEvent.click(screen.getAllByText("Sair")[0]);
  expect(mockSignout).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

test("botao de tema chama toggleTheme", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  fireEvent.click(screen.getByTitle("Mudar para Light"));
  expect(mockToggleTheme).toHaveBeenCalledTimes(1);
});

test("icone do tema exibe sol no modo dark", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByTitle("Mudar para Light")).toBeInTheDocument();
});

test("exibe o language switcher com PT e EN", () => {
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.getByText("PT")).toBeInTheDocument();
  expect(screen.getByText("EN")).toBeInTheDocument();
});
