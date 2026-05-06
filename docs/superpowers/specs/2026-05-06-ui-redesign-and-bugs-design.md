# Design Spec — UI Redesign + Bug Fixes
**Data:** 2026-05-06  
**Status:** Aprovado pelo usuário

---

## Contexto

O projeto `organizador-treinos` é um monorepo com backend Quarkus + frontend React 18.  
Três problemas foram identificados para este sprint:

1. **Bug — Home hardcoded:** A página `/home` exibe um treino fixo ("Treino de ombros e biceps") com exercícios estáticos. Não consome o backend.
2. **Bug — Conta em branco:** A página `/account` é HTML estático sem estado. Não carrega dados do usuário. Possui campos que não existem no banco (`sobrenome`, `CEP`, `estado`, `cidade`, `endereço`).
3. **Feature — Redesign visual:** Interface atual tem aparência de POC. Requer visual moderno, com tema dark (padrão) e toggle para light, usando Bootstrap + CSS Variables.

---

## Decisões tomadas

| Questão | Decisão |
|---|---|
| Campos do perfil | Simples: apenas `name` (editável) + `email` (read-only). Sem campos extras. |
| Home page | Dashboard real: mostra estatísticas + último treino criado, com exercícios checkáveis. |
| Abordagem CSS | Bootstrap + CSS Custom Properties + `ThemeContext`. Sem migração para Tailwind. |
| Tema padrão | Dark Fitness (âmbar/vermelho). Toggle persiste no `localStorage`. |

---

## Arquitetura

### Sistema de temas (CSS Variables)

Criar `src/styles/theme.css` com dois conjuntos de custom properties controlados via `data-theme` no `<body>`:

```css
[data-theme="dark"] {
  --bg-primary:   #0b0e17;
  --bg-surface:   #131720;
  --bg-card:      #1a2035;
  --border:       #242d45;
  --text-primary: #e2e8f0;
  --text-muted:   #64748b;
  --accent:       #f59e0b;
  --accent-alt:   #ef4444;
  --success:      #10b981;
}

[data-theme="light"] {
  --bg-primary:   #f0f4f8;
  --bg-surface:   #ffffff;
  --bg-card:      #ffffff;
  --border:       #e2e8f0;
  --text-primary: #0f172a;
  --text-muted:   #64748b;
  --accent:       #6366f1;
  --accent-alt:   #8b5cf6;
  --success:      #10b981;
}
```

### ThemeContext

Criar `src/contexts/theme.js`:
- Estado: `theme` = `"dark"` | `"light"`
- Ao montar: lê `localStorage.getItem("theme")` primeiro; se não existir, verifica `prefers-color-scheme: dark`; fallback final = `"dark"`
- `toggleTheme()`: alterna e persiste no `localStorage`
- Aplica `document.body.setAttribute("data-theme", theme)` via `useEffect`
- Expõe `{ theme, toggleTheme }` via context

### Integração no App.js

Envolver a árvore em `<ThemeProvider>` (do `theme.js`). Importar `theme.css` globalmente.

---

## Componentes modificados

### 1. NavBar (`src/components/NavBar/index.js`)

**Atual:** NavBar Bootstrap genérico sem estado, sem logout, sem identificação do usuário.

**Novo:**
- Usa `useAuth()` para exibir nome do usuário e habilitar logout
- Usa `useTheme()` para toggle dark/light (ícone sol/lua)
- Links: **Dashboard** (`/home`) · **Meus Treinos** (`/myworkouts`) · **Conta** (`/account`)
- Avatar com iniciais do usuário (ex: "RC" para Rodrigo Cabral)
- Botão "Sair" chama `signout()` e navega para `/`
- Aplica variáveis CSS do tema (`--bg-surface`, `--border`, `--text-primary`, etc.)

### 2. Home — Dashboard (`src/pages/Home/index.js`)

**Atual:** 9 checkboxes hardcoded, sem chamada ao backend.

**Novo:**
- `useEffect` ao montar: chama `workoutService.getMyWorkouts()` 
- Ordena por `updatedAt` decrescente client-side, pega o primeiro resultado (mais recente)
- Se há treino recente: chama `workoutService.getWorkout(id)` para obter os exercícios
- Se não há treinos: exibe empty state com CTA "Criar primeiro treino"
- **Estatísticas** (topo da página): total de treinos do usuário
- **Card do último treino**: nome, lista de exercícios checkáveis com barra de progresso
  - Checkbox ao clicar: chama `exerciseService.toggleExercise(workoutId, exerciseId)` — o backend alterna o estado automaticamente via `PATCH /workouts/{workoutId}/exercises/{exerciseId}/toggle`
  - Progresso: `concluídos / total` — badge e barra de progresso animada
- Botão "+ Novo Treino" navega para `/newworkout`
- Estados de loading e erro com feedback visual

**Nota sobre o backend:** `GET /workouts` já retorna a lista completa. `GET /workouts/{id}` retorna o treino com exercícios. Nenhuma mudança no backend é necessária para este fluxo.

### 3. Minha Conta (`src/pages/Account/index.js`)

**Atual:** HTML estático, campos inexistentes no banco, sem estado.

**Novo — campos exibidos:**
- `name` — input editável, pré-populado com `user.name` do `AuthContext`
- `email` — input desabilitado (read-only), pré-populado com `user.email`

**Fluxo:**
- `useEffect` ao montar: lê `user` do `AuthContext` (já disponível, sem nova chamada HTTP)
- Formulário controlado com `useState` para `name`
- "Salvar alterações": chama `authService.updateUser(name)` (PUT `/users/me`)
  - Sucesso: atualiza o `user` no `AuthContext` via função `updateUser` (a ser adicionada ao context)
  - Erro: exibe mensagem inline
- "Cancelar": restaura o valor original

**Nota:** Alterar e-mail e senha não é suportado pelo backend atual — omitir esses campos do form. Sem campos de endereço/estado/CEP.

### 4. AuthContext (`src/contexts/auth.js`)

Adicionar função `updateUser(updatedUser)` ao valor do context para que a página Conta possa sincronizar o nome atualizado sem precisar refazer login.

---

## Serviço de exercícios

`src/services/exerciseService.js` já possui `toggleExercise(workoutId, exerciseId)`, que chama `PATCH /workouts/{workoutId}/exercises/{exerciseId}/toggle`. O backend alterna o estado automaticamente — sem necessidade de enviar o novo valor. Nenhuma mudança no service é necessária.

---

## Visual — Paleta de tokens

| Token | Dark | Light |
|---|---|---|
| `--bg-primary` | `#0b0e17` | `#f0f4f8` |
| `--bg-surface` | `#131720` | `#ffffff` |
| `--bg-card` | `#1a2035` | `#ffffff` |
| `--border` | `#242d45` | `#e2e8f0` |
| `--text-primary` | `#e2e8f0` | `#0f172a` |
| `--text-muted` | `#64748b` | `#64748b` |
| `--accent` | `#f59e0b` | `#6366f1` |
| `--accent-alt` | `#ef4444` | `#8b5cf6` |
| `--success` | `#10b981` | `#10b981` |

---

## Escopo das mudanças

### Novos arquivos
- `src/styles/theme.css`
- `src/contexts/theme.js`

### Arquivos modificados
- `src/index.js` — importar `theme.css`
- `src/App.js` — envolver com `ThemeProvider`
- `src/contexts/auth.js` — adicionar `updateUser` ao context
- `src/components/NavBar/index.js` — redesign completo
- `src/pages/Home/index.js` — dashboard conectado ao backend
- `src/pages/Account/index.js` — conectado ao backend, campos corretos

### Fora de escopo
- Migração para Tailwind CSS (decisão futura)
- Alteração de senha (requer novo endpoint no backend)
- Alteração de e-mail (requer novo endpoint + validação)
- Campos extras no perfil (sobrenome, endereço, etc.)
- Redesign das páginas `MyWorkouts`, `NewWorkout`, `WorkoutDetail`, `Signin`, `Signup` (próximo sprint)

---

## Critérios de sucesso

- [ ] Home não exibe dados hardcoded; mostra o treino mais recente do backend ou empty state
- [ ] Conta carrega `name` e `email` do usuário ao abrir; nome pode ser editado e salvo
- [ ] Toggle dark/light funciona em todas as páginas e persiste ao recarregar
- [ ] NavBar exibe nome do usuário e botão "Sair" funcional
- [ ] Nenhuma regressão nas páginas `MyWorkouts`, `NewWorkout`, `Signin`, `Signup`
