import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccountPage from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");
jest.mock("../../services/authService");
jest.mock("../../services/userService");
jest.mock("../../components/NavBar", () => () => <div data-testid="navbar" />);

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import authService from "../../services/authService";
import userService from "../../services/userService";

const mockUpdateUser = jest.fn();
const mockSignout = jest.fn();

beforeEach(() => {
  useAuth.mockReturnValue({
    user: { name: "Rodrigo Bock", email: "rodrigo@email.com" },
    updateUser: mockUpdateUser,
    signout: mockSignout,
  });
  useTheme.mockReturnValue({ theme: "dark", toggleTheme: jest.fn() });
  authService.updateUser = jest.fn().mockResolvedValue({
    id: "1",
    name: "Rodrigo Bock",
    email: "rodrigo@email.com",
  });
  userService.changePassword = jest.fn().mockResolvedValue({});
  userService.deleteAccount = jest.fn().mockResolvedValue({});
  mockUpdateUser.mockClear();
  mockSignout.mockClear();
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
  const cancelButtons = screen.getAllByText("Cancelar");
  fireEvent.click(cancelButtons[0]);
  expect(screen.getByDisplayValue("Rodrigo Bock")).toBeInTheDocument();
});

function getPasswordInputs(container) {
  // 0: senha atual, 1: nova senha, 2: confirmar nova senha (modal de delete só aparece quando aberto)
  return container.querySelectorAll('input[type="password"]');
}

test("Trocar senha: erro quando nova senha e confirmação não são iguais", async () => {
  const { container } = render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const [oldP, newP, confirmP] = getPasswordInputs(container);
  fireEvent.change(oldP, { target: { value: "OldPass1" } });
  fireEvent.change(newP, { target: { value: "NewPass123" } });
  fireEvent.change(confirmP, { target: { value: "Different1" } });
  fireEvent.click(screen.getByText("Salvar Nova Senha"));
  await waitFor(() => {
    expect(screen.getByText("As novas senhas não são iguais")).toBeInTheDocument();
  });
  expect(userService.changePassword).not.toHaveBeenCalled();
});

test("Trocar senha: chama userService.changePassword e exibe sucesso", async () => {
  const { container } = render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const [oldP, newP, confirmP] = getPasswordInputs(container);
  fireEvent.change(oldP, { target: { value: "OldPass1" } });
  fireEvent.change(newP, { target: { value: "NewPass123" } });
  fireEvent.change(confirmP, { target: { value: "NewPass123" } });
  fireEvent.click(screen.getByText("Salvar Nova Senha"));
  await waitFor(() => {
    expect(userService.changePassword).toHaveBeenCalledWith("OldPass1", "NewPass123");
  });
  expect(await screen.findByText("Senha alterada com sucesso!")).toBeInTheDocument();
});

test("Trocar senha: exibe erro quando API falha", async () => {
  userService.changePassword.mockRejectedValue({
    response: { data: { message: "Senha atual incorreta" } },
  });
  const { container } = render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const [oldP, newP, confirmP] = getPasswordInputs(container);
  fireEvent.change(oldP, { target: { value: "WrongOld1" } });
  fireEvent.change(newP, { target: { value: "NewPass123" } });
  fireEvent.change(confirmP, { target: { value: "NewPass123" } });
  fireEvent.click(screen.getByText("Salvar Nova Senha"));
  expect(await screen.findByText("Senha atual incorreta")).toBeInTheDocument();
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
