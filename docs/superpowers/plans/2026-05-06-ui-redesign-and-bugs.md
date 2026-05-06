# UI Redesign + Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir a Home (dados hardcoded) e Conta (campos em branco), adicionar sistema de tema dark/light com toggle persistente, e redesenhar a NavBar com logout e info do usuário.

**Architecture:** Bootstrap permanece como base. CSS custom properties (`--bg-primary`, `--accent`, etc.) são controladas pelo atributo `data-theme` no `<body>` via `ThemeContext`. Componentes lêem os tokens via variáveis CSS — sem dependência de styled-components para temas. Home carrega `GET /workouts` e `GET /workouts/{id}` para exibir o treino mais recente com exercícios checkáveis.

**Tech Stack:** React 18, Bootstrap 5 / React Bootstrap, CSS Custom Properties, Jest + React Testing Library

**Rodar testes (modo não-interativo):**
```bash
cd organizador-treinos-front-end
npm test -- --watchAll=false
```

---

## Mapa de arquivos

| Ação | Arquivo |
|---|---|
| Criar | `src/styles/theme.css` |
| Criar | `src/contexts/theme.js` |
| Criar | `src/contexts/theme.test.js` |
| Criar | `src/components/NavBar/index.test.js` |
| Criar | `src/pages/Account/index.test.js` |
| Criar | `src/pages/Home/index.test.js` |
| Modificar | `src/index.js` |
| Modificar | `src/App.js` |
| Modificar | `src/styles/global.js` |
| Modificar | `src/components/NavBar/index.js` |
| Modificar | `src/contexts/auth.js` |
| Modificar | `src/pages/Account/index.js` |
| Modificar | `src/pages/Home/index.js` |

---

## Task 1: Sistema de temas (CSS Variables + ThemeContext)

**Files:**
- Create: `src/styles/theme.css`
- Create: `src/contexts/theme.js`
- Create: `src/contexts/theme.test.js`
- Modify: `src/index.js`
- Modify: `src/App.js`
- Modify: `src/styles/global.js`

- [ ] **Step 1: Escrever o teste do ThemeContext**

Crie `src/contexts/theme.test.js`:

```javascript
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
```

- [ ] **Step 2: Rodar os testes — verificar que falham**

```bash
npm test -- --watchAll=false --testPathPattern="theme.test"
```

Esperado: FAIL — `Cannot find module './theme'`

- [ ] **Step 3: Criar `src/styles/theme.css`**

```css
[data-theme="dark"] {
  --bg-primary:        #0b0e17;
  --bg-surface:        #131720;
  --bg-card:           #1a2035;
  --border:            #242d45;
  --text-primary:      #e2e8f0;
  --text-muted:        #64748b;
  --accent:            #f59e0b;
  --accent-alt:        #ef4444;
  --success:           #10b981;
  --nav-active-bg:     rgba(245, 158, 11, 0.08);
  --nav-active-color:  #f59e0b;
  --btn-primary-bg:    linear-gradient(135deg, #f59e0b, #f97316);
  --btn-primary-text:  #000000;
}

[data-theme="light"] {
  --bg-primary:        #f0f4f8;
  --bg-surface:        #ffffff;
  --bg-card:           #ffffff;
  --border:            #e2e8f0;
  --text-primary:      #0f172a;
  --text-muted:        #64748b;
  --accent:            #6366f1;
  --accent-alt:        #8b5cf6;
  --success:           #10b981;
  --nav-active-bg:     #eef2ff;
  --nav-active-color:  #6366f1;
  --btn-primary-bg:    linear-gradient(135deg, #6366f1, #8b5cf6);
  --btn-primary-text:  #ffffff;
}

body {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

- [ ] **Step 4: Criar `src/contexts/theme.js`**

```javascript
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme(prev => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 5: Rodar os testes — verificar que passam**

```bash
npm test -- --watchAll=false --testPathPattern="theme.test"
```

Esperado: PASS — 5 tests passed

- [ ] **Step 6: Atualizar `src/index.js`**

```javascript
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.querySelector("#root"));
root.render(<App />);
```

- [ ] **Step 7: Atualizar `src/App.js`**

Remover o import duplicado de bootstrap e envolver com `ThemeProvider`:

```javascript
import React from "react";
import RoutesApp from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ThemeProvider } from "./contexts/theme";
import GlobalStyle from "./styles/global";

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <RoutesApp />
      <GlobalStyle />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
```

- [ ] **Step 8: Atualizar `src/styles/global.js`**

Remover background hardcoded — agora vem do `theme.css`:

```javascript
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 100vw;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
`;

export default GlobalStyle;
```

- [ ] **Step 9: Rodar todos os testes**

```bash
npm test -- --watchAll=false
```

Esperado: sem regressões, 5 novos testes passando

---

## Task 2: NavBar redesign

**Files:**
- Modify: `src/components/NavBar/index.js`
- Create: `src/components/NavBar/index.test.js`

- [ ] **Step 1: Escrever o teste da NavBar**

Crie `src/components/NavBar/index.test.js`:

```javascript
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
```

- [ ] **Step 2: Rodar os testes — verificar que falham**

```bash
npm test -- --watchAll=false --testPathPattern="NavBar/index.test"
```

Esperado: FAIL

- [ ] **Step 3: Reescrever `src/components/NavBar/index.js`**

```javascript
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";

function NavBar() {
  const { user, signout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map(w => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <Navbar
      expand="lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 0",
      }}
    >
      <Container>
        <Navbar.Brand
          href="/home"
          style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}
        >
          💪 Treinos
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="nav-main" />
        <Navbar.Collapse id="nav-main">
          <Nav className="me-auto" style={{ gap: 4 }}>
            <Nav.Link href="/home" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Dashboard
            </Nav.Link>
            <Nav.Link href="/myworkouts" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Meus Treinos
            </Nav.Link>
            <Nav.Link href="/account" style={{ color: "var(--text-muted)", fontSize: 13 }}>
              Conta
            </Nav.Link>
          </Nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Mudar para Light" : "Mudar para Dark"}
              style={{
                background: "none",
                border: "none",
                fontSize: 16,
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: 6,
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--nav-active-bg)",
                color: "var(--accent)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            {firstName && (
              <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                {firstName}
              </span>
            )}

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 12,
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              Sair
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
```

- [ ] **Step 4: Rodar os testes — verificar que passam**

```bash
npm test -- --watchAll=false --testPathPattern="NavBar/index.test"
```

Esperado: PASS — 5 tests passed

- [ ] **Step 5: Rodar todos os testes**

```bash
npm test -- --watchAll=false
```

Esperado: sem regressões

---

## Task 3: Fix — Minha Conta conectada ao backend

**Files:**
- Modify: `src/contexts/auth.js`
- Modify: `src/pages/Account/index.js`
- Create: `src/pages/Account/index.test.js`

- [ ] **Step 1: Adicionar `updateUser` ao AuthContext**

Em `src/contexts/auth.js`, adicionar a função `updateUser` e expô-la no Provider:

```javascript
import { createContext, useEffect, useState } from "react";
import authService from "../services/authService";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      setUser(response.user);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao fazer login";
      setError(errorMsg);
      return errorMsg;
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const response = await authService.signup(name, email, password);
      authService.setToken(response.token);
      setUser(response.user);
      return null;
    } catch (err) {
      const errorMsg = err.message || "Erro ao registrar";
      setError(errorMsg);
      return errorMsg;
    }
  };

  const signout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        loading,
        error,
        signin,
        signup,
        signout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

- [ ] **Step 2: Escrever o teste da página Conta**

Crie `src/pages/Account/index.test.js`:

```javascript
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
  authService.updateUser = jest.fn().mockResolvedValue({ id: "1", name: "Rodrigo Bock", email: "rodrigo@email.com" });
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
  authService.updateUser.mockResolvedValue({ id: "1", name: "Rodrigo Editado", email: "rodrigo@email.com" });
  render(<MemoryRouter><AccountPage /></MemoryRouter>);
  const input = screen.getByDisplayValue("Rodrigo Bock");
  fireEvent.change(input, { target: { value: "Rodrigo Editado" } });
  fireEvent.click(screen.getByText("Salvar alterações"));
  await waitFor(() => {
    expect(mockUpdateUser).toHaveBeenCalledWith({ id: "1", name: "Rodrigo Editado", email: "rodrigo@email.com" });
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
```

- [ ] **Step 3: Rodar os testes — verificar que falham**

```bash
npm test -- --watchAll=false --testPathPattern="Account/index.test"
```

Esperado: FAIL

- [ ] **Step 4: Reescrever `src/pages/Account/index.js`**

```javascript
import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";

function AccountPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("O nome não pode estar vazio");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const updated = await authService.updateUser(name.trim());
      updateUser(updated);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setError("");
    setSuccess(false);
  };

  return (
    <>
      <NavBar />
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          backgroundColor: "var(--bg-primary)",
          padding: "32px 16px",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Minha Conta
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
              Gerencie seus dados
            </p>
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 24,
            }}
          >
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                    setSuccess(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--bg-primary)",
                    color: "var(--text-muted)",
                    fontSize: 14,
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }}
                />
              </div>

              {error && (
                <p
                  style={{
                    color: "var(--accent-alt)",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  style={{
                    color: "var(--success)",
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  Dados atualizados com sucesso!
                </p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--btn-primary-bg)",
                    color: "var(--btn-primary-text)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountPage;
```

- [ ] **Step 5: Rodar os testes — verificar que passam**

```bash
npm test -- --watchAll=false --testPathPattern="Account/index.test"
```

Esperado: PASS — 7 tests passed

- [ ] **Step 6: Rodar todos os testes**

```bash
npm test -- --watchAll=false
```

Esperado: sem regressões

---

## Task 4: Fix — Home dashboard conectada ao backend

**Files:**
- Modify: `src/pages/Home/index.js`
- Create: `src/pages/Home/index.test.js`

- [ ] **Step 1: Escrever o teste da Home**

Crie `src/pages/Home/index.test.js`:

```javascript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./index";

jest.mock("../../hooks/useAuth");
jest.mock("../../contexts/theme");
jest.mock("../../services/workoutService");
jest.mock("../../services/exerciseService");
jest.mock("../../components/NavBar", () => () => <div data-testid="navbar" />);

import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../contexts/theme";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";

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
  useAuth.mockReturnValue({ user: { name: "Rodrigo Bock", email: "r@test.com" } });
  useTheme.mockReturnValue({ theme: "dark", toggleTheme: jest.fn() });
  workoutService.getMyWorkouts = jest.fn().mockResolvedValue(fakeWorkouts);
  workoutService.getWorkout = jest.fn().mockResolvedValue(fakeWorkoutDetail);
  exerciseService.toggleExercise = jest.fn().mockResolvedValue({ id: "e2", name: "Remada Baixa", completed: true });
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
  // Clicar no texto do exercício — o evento buba até o div pai que tem onClick
  fireEvent.click(screen.getByText("Remada Baixa"));
  await waitFor(() => {
    expect(exerciseService.toggleExercise).toHaveBeenCalledWith("w1", "e2");
  });
});

test("exibe o total de treinos nas estatísticas", async () => {
  render(<MemoryRouter><HomePage /></MemoryRouter>);
  await waitFor(() => {
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar os testes — verificar que falham**

```bash
npm test -- --watchAll=false --testPathPattern="Home/index.test"
```

Esperado: FAIL

- [ ] **Step 3: Reescrever `src/pages/Home/index.js`**

```javascript
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import workoutService from "../../services/workoutService";
import exerciseService from "../../services/exerciseService";
import useAuth from "../../hooks/useAuth";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [latestWorkout, setLatestWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const all = await workoutService.getMyWorkouts();
        setWorkouts(all);
        if (all.length > 0) {
          const sorted = [...all].sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          const detail = await workoutService.getWorkout(sorted[0].id);
          setLatestWorkout(detail);
        }
      } catch (err) {
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = async (exerciseId) => {
    if (!latestWorkout) return;
    try {
      const updated = await exerciseService.toggleExercise(latestWorkout.id, exerciseId);
      setLatestWorkout(prev => ({
        ...prev,
        exercises: prev.exercises.map(ex => (ex.id === exerciseId ? updated : ex)),
      }));
    } catch (_) {}
  };

  const firstName = user?.name?.split(" ")[0] || "você";
  const exercises = latestWorkout?.exercises || [];
  const completed = exercises.filter(ex => ex.completed).length;
  const total = exercises.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <>
      <NavBar />
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          backgroundColor: "var(--bg-primary)",
          padding: "24px 16px",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                Olá, {firstName} 👋
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: 14, margin: 0 }}>
                {loading ? "Carregando..." : "Aqui está o seu treino mais recente"}
              </p>
            </div>
            <button
              onClick={() => navigate("/newworkout")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              + Novo Treino
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {[
              { label: "Meus Treinos", value: workouts.length, accent: false },
              { label: "Exercícios", value: total, accent: true },
              { label: "Concluídos", value: completed, accent: false },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: stat.accent ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {loading ? "—" : stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "var(--accent-alt)",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && workouts.length === 0 && (
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
              <h3
                style={{
                  color: "var(--text-primary)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Nenhum treino criado ainda
              </h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  marginBottom: 20,
                }}
              >
                Crie seu primeiro treino e comece a organizar seus exercícios
              </p>
              <button
                onClick={() => navigate("/newworkout")}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Criar primeiro treino
              </button>
            </div>
          )}

          {/* Latest workout */}
          {!loading && latestWorkout && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                  marginBottom: 10,
                }}
              >
                Último treino
              </div>
              <div
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "18px 18px 14px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {latestWorkout.name}
                  </h3>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 4,
                      background: "rgba(245,158,11,0.1)",
                      color: "var(--accent)",
                    }}
                  >
                    {completed} / {total}
                  </span>
                </div>

                {exercises.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    Nenhum exercício neste treino.
                  </p>
                ) : (
                  exercises.map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => handleToggle(ex.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "9px 0",
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${ex.completed ? "var(--success)" : "var(--border)"}`,
                          background: ex.completed ? "var(--success)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {ex.completed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4l3 3 5-6"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          color: ex.completed ? "var(--text-muted)" : "var(--text-primary)",
                          textDecoration: ex.completed ? "line-through" : "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {ex.name}
                      </span>
                    </div>
                  ))
                )}

                {total > 0 && (
                  <div
                    style={{
                      height: 4,
                      background: "var(--border)",
                      borderRadius: 2,
                      marginTop: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, var(--accent), var(--accent-alt))",
                        borderRadius: 2,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => navigate(`/workout/${latestWorkout.id}`)}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "9px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Ver treino completo →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default HomePage;
```

- [ ] **Step 4: Rodar os testes — verificar que passam**

```bash
npm test -- --watchAll=false --testPathPattern="Home/index.test"
```

Esperado: PASS — 8 tests passed

- [ ] **Step 5: Rodar a suite completa**

```bash
npm test -- --watchAll=false
```

Esperado: todos os testes passando, sem regressões

---

## Verificação final (manual)

Após todos os testes passarem, verificar manualmente com o backend rodando:

- [ ] Login → Home exibe saudação com primeiro nome e tela carregando
- [ ] Home sem treinos → exibe empty state com CTA
- [ ] Home com treinos → exibe o mais recente com exercícios; clicar em exercício togla status
- [ ] Toggle dark/light na NavBar → tema muda em tempo real; recarregar → tema persiste
- [ ] NavBar → botão "Sair" → volta para login
- [ ] Conta → campos nome e email pré-preenchidos; editar nome → salvar → "Dados atualizados com sucesso!"
- [ ] Conta → editar nome → cancelar → campo volta ao valor original
