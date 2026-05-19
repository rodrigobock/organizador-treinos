import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");
jest.mock("../../services/workoutService");
jest.mock("../../services/exerciseService");
jest.mock("../../services/sessionService");
jest.mock("../../components/NavBar", () => () => <div data-testid="navbar" />);

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import sessionService from "../../services/sessionService";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const fakeWorkouts = [
  { id: "w1", name: "Costas e Bíceps", updatedAt: "2026-05-06T10:00:00", isPublic: false },
  { id: "w2", name: "Pernas", updatedAt: "2026-05-05T10:00:00", isPublic: false },
];

const fakeWorkoutDetail = {
  id: "w1",
  name: "Costas e Bíceps",
  exercises: [
    { id: "e1", name: "Pulldown Hummer", completed: true },
    { id: "e2", name: "Remada Baixa", completed: false },
  ],
};

beforeEach(() => {
  useAuth.mockReturnValue({ user: { name: "Rodrigo Bock", email: "r@test.com" }, reloadUser: jest.fn().mockResolvedValue(null) });
  useTheme.mockReturnValue({ theme: "dark", toggleTheme: jest.fn() });
  workoutService.getMyWorkouts = jest.fn().mockResolvedValue(fakeWorkouts);
  workoutService.getWorkout = jest.fn().mockResolvedValue(fakeWorkoutDetail);
  exerciseService.toggleExercise = jest.fn().mockResolvedValue({
    id: "e2",
    name: "Remada Baixa",
    completed: true,
  });
  sessionService.getActiveSession = jest.fn().mockResolvedValue({ id: "s1" });
  sessionService.startSession = jest.fn().mockResolvedValue({ id: "s1" });
  sessionService.endSession = jest.fn().mockResolvedValue(null);
  mockNavigate.mockClear();
});

test("exibe empty state quando não há treinos", async () => {
  workoutService.getMyWorkouts.mockResolvedValue([]);
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(screen.getByText("Nenhum treino criado ainda")).toBeInTheDocument();
  });
});

test("CTA do empty state navega para /newworkout", async () => {
  workoutService.getMyWorkouts.mockResolvedValue([]);
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => screen.getByText("Criar primeiro treino"));
  fireEvent.click(screen.getByText("Criar primeiro treino"));
  expect(mockNavigate).toHaveBeenCalledWith("/newworkout");
});

test("chama getMyWorkouts ao montar", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(workoutService.getMyWorkouts).toHaveBeenCalledTimes(1);
  });
});

test("carrega o detalhe do treino mais recente (maior updatedAt)", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(workoutService.getWorkout).toHaveBeenCalledWith("w1");
  });
});

test("exibe o nome do treino mais recente", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(screen.getByText("Costas e Bíceps")).toBeInTheDocument();
  });
});

test("exibe os exercícios do treino", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(screen.getByText("Pulldown Hummer")).toBeInTheDocument();
    expect(screen.getByText("Remada Baixa")).toBeInTheDocument();
  });
});

test("clicar em exercício chama toggleExercise", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => screen.getByText("Remada Baixa"));
  fireEvent.click(screen.getByText("Remada Baixa"));
  await waitFor(() => {
    expect(exerciseService.toggleExercise).toHaveBeenCalledWith("w1", "e2");
  });
});

test("exibe o total de treinos nas estatísticas", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(screen.getByText("Meus Treinos")).toBeInTheDocument();
    // fakeWorkouts tem 2 itens; getAllByText para evitar colisão com outros "2" no DOM
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
  });
});
