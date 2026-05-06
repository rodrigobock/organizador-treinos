import { render, act, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme";

function TestConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.body.removeAttribute("data-theme");
});

test("padrão é dark quando não há preferência salva", () => {
  render(<ThemeProvider><TestConsumer /></ThemeProvider>);
  expect(screen.getByTestId("theme").textContent).toBe("dark");
});

test("lê tema salvo no localStorage", () => {
  localStorage.setItem("theme", "light");
  render(<ThemeProvider><TestConsumer /></ThemeProvider>);
  expect(screen.getByTestId("theme").textContent).toBe("light");
});

test("toggleTheme alterna entre dark e light", () => {
  render(<ThemeProvider><TestConsumer /></ThemeProvider>);
  act(() => screen.getByRole("button").click());
  expect(screen.getByTestId("theme").textContent).toBe("light");
  act(() => screen.getByRole("button").click());
  expect(screen.getByTestId("theme").textContent).toBe("dark");
});

test("persiste o tema no localStorage ao alternar", () => {
  render(<ThemeProvider><TestConsumer /></ThemeProvider>);
  act(() => screen.getByRole("button").click());
  expect(localStorage.getItem("theme")).toBe("light");
});

test("aplica data-theme no body", () => {
  render(<ThemeProvider><TestConsumer /></ThemeProvider>);
  expect(document.body.getAttribute("data-theme")).toBe("dark");
  act(() => screen.getByRole("button").click());
  expect(document.body.getAttribute("data-theme")).toBe("light");
});
