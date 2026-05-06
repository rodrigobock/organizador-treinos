import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountPage from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");
jest.mock("../../services/authService");
jest.mock("../../components/NavBar", () => () => <div data-testid="navbar" />);

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import authService from "../../services/authService";

const mockUpdateUser = jest.fn();

beforeEach(() => {
  useAuth.mockReturnValue({
    user: { name: "Rodrigo Bock", email: "rodrigo@email.com" },
    updateUser: mockUpdateUser,
  });
  useTheme.mockReturnValue({ theme: "dark", toggleTheme: jest.fn() });
  authService.updateUser = jest.fn().mockResolvedValue({
    id: "1",
    name: "Rodrigo Bock",
    email: "rodrigo@email.com",
  });
  mockUpdateUser.mockClear();
});

test("pré-popula o campo nome com o nome do usuário", () => {
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  expect(screen.getByDisplayValue("Rodrigo Bock")).toBeInTheDocument();
});

test("pré-popula o campo email com o email do usuário (desabilitado)", () => {
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const emailInput = screen.getByDisplayValue("rodrigo@email.com");
  expect(emailInput).toBeDisabled();
});

test("Cancelar restaura o nome original", () => {
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const input = screen.getByDisplayValue("Rodrigo Bock");
  fireEvent.change(input, { target: { value: "Nome Novo" } });
  fireEvent.click(screen.getByText("Cancelar"));
  expect(screen.getByDisplayValue("Rodrigo Bock")).toBeInTheDocument();
});

test("Salvar chama authService.updateUser com o nome digitado", async () => {
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const input = screen.getByDisplayValue("Rodrigo Bock");
  fireEvent.change(input, { target: { value: "Rodrigo Editado" } });
  fireEvent.click(screen.getByText("Salvar alterações"));
  await waitFor(() => {
    expect(authService.updateUser).toHaveBeenCalledWith("Rodrigo Editado");
  });
});

test("Salvar chama updateUser do contexto com o retorno da API", async () => {
  authService.updateUser.mockResolvedValue({
    id: "1",
    name: "Rodrigo Editado",
    email: "rodrigo@email.com",
  });
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const input = screen.getByDisplayValue("Rodrigo Bock");
  fireEvent.change(input, { target: { value: "Rodrigo Editado" } });
  fireEvent.click(screen.getByText("Salvar alterações"));
  await waitFor(() => {
    expect(mockUpdateUser).toHaveBeenCalledWith({
      id: "1",
      name: "Rodrigo Editado",
      email: "rodrigo@email.com",
    });
  });
});

test("exibe mensagem de sucesso após salvar", async () => {
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  fireEvent.click(screen.getByText("Salvar alterações"));
  await waitFor(() => {
    expect(screen.getByText("Dados atualizados com sucesso!")).toBeInTheDocument();
  });
});

test("exibe mensagem de erro quando a API falha", async () => {
  authService.updateUser.mockRejectedValue({ message: "Erro de servidor" });
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  fireEvent.click(screen.getByText("Salvar alterações"));
  await waitFor(() => {
    expect(screen.getByText("Erro de servidor")).toBeInTheDocument();
  });
});
