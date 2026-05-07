# Próximas Tarefas - Organizador de Treinos

**Status**: Atualizado em 2026-05-07

---

## Phase 5: Polishing

### OT-1: Sucesso na redefinição de senha
**Status**: `[ ] Pendente`  
**Prioridade**: Low  
**Esforço**: 30min

`ResetPassword.js` navega para "/" com `state: { message: "..." }` após reset bem-sucedido.

Adicionar em `Signin.js`: ler `useLocation()` e exibir mensagem de sucesso no topo. Limpar depois de 5s.

**Aceitar quando**: Usuário vê "Senha redefinida com sucesso" após reset bem-sucedido.

---

### OT-2: Rate limiting endpoints auth
**Status**: `[ ] Pendente`  
**Prioridade**: High (security)  
**Esforço**: 2-3h

Implementar rate limiting em:
- `POST /auth/login` (5 tentativas / 15 min)
- `POST /auth/signup` (3 por IP / hora)
- `POST /auth/forgot-password` (3 por email / hora)

Usar Quarkus Bucket4j extension. Retornar 429 Too Many Requests.

**Aceitar quando**: Login repetido 6 vezes retorna 429.

---

### OT-3: Paginação lista de treinos
**Status**: `[ ] Pendente`  
**Prioridade**: Medium  
**Esforço**: 2-3h

`MyWorkouts/index.js` carrega tudo de uma vez.

**Backend**: Adicionar query params `?page=0&size=10` em `GET /workouts`

**Frontend**: Infinite scroll ou pagination buttons. Usar `react-paginate` ou similar.

**Aceitar quando**: Carregar 100+ treinos, listar com paginação, navegar entre páginas.

---

### OT-4: Token refresh/rotation
**Status**: `[ ] Pendente`  
**Prioridade**: High (security)  
**Esforço**: 2-3h

Implementar refresh token flow:
- Backend: `POST /auth/refresh` (body: old token, retorna novo)
- Frontend: interceptor Axios detecta 401, chama refresh, retry request

Ou usar short-lived tokens + automatic refresh on 401.

**Aceitar quando**: Token expira, frontend refresh automático, requisição retry sucede.

---

## Account Page Features

### OT-5: Endpoint mudar senha
**Status**: `[ ] Pendente`  
**Prioridade**: Medium  
**Esforço**: 1h

Backend: `PUT /users/me/password`

Body: `{ oldPassword, newPassword }`

Validar `oldPassword` contra hash. Hash `newPassword` com BCrypt. Retornar 200 ou 400.

**Aceitar quando**: PUT com senha errada retorna 400; com correta atualiza password.

---

### OT-6: Formulário mudar senha
**Status**: `[ ] Pendente`  
**Prioridade**: Medium  
**Esforço**: 1h  
**Bloqueado por**: OT-5

Frontend: `Account/index.js`

Seção "Trocar Senha":
- Input senha atual
- Input senha nova
- Input confirmar senha (validar match)
- Botão "Salvar"

Chamar `userService.changePassword()`. Exibir sucesso/erro.

**Aceitar quando**: Mudar senha com sucesso, confirmar nova senha funciona no login.

---

### OT-7: Endpoint deletar conta
**Status**: `[ ] Pendente`  
**Prioridade**: Low  
**Esforço**: 1h

Backend: `DELETE /users/me`

Body: `{ password }`

Validar password. Deletar user + cascade (workouts, exercises, sessions, shares). Retornar 204.

**Aceitar quando**: DELETE com senha correta deleta user e todos dados.

---

### OT-8: Confirmação deletar conta
**Status**: `[ ] Pendente`  
**Prioridade**: Low  
**Esforço**: 1h  
**Bloqueado por**: OT-7

Frontend: `Account/index.js`

Seção "Zona de Perigo":
- Botão "Deletar Conta" (red, disabled inicialmente)
- Modal com:
  - Aviso: "Esta ação é irreversível"
  - Input senha para confirmar
  - Botão "Deletar Permanentemente"

Após delete: logout + redirect `/signin` com mensagem.

**Aceitar quando**: Usuário deleta conta, redirect signin, login com aquele email falha.

---

## Concluído (2026-05-07)

✅ **Cycling de treinos** (OT-CYCLE-1)  
- Ordem drag-and-drop em MyWorkouts
- `currentWorkoutId` avança automaticamente após session end
- Ciclo circular (wrap-around)

✅ **Checkbox gated by session** (OT-CYCLE-2)  
- Exercise checkboxes só interativas durante session ativa
- Visual: opacity 0.5, cursor default quando inativo

✅ **Icons UI replacements** (OT-CYCLE-3)  
- Trash icon (Trash) substitui "Deletar"
- Pencil icon (PencilSquare) substitui "Ver"/"Editar"
- GripVertical handle em MyWorkouts drag

---

## Legenda

- `[ ]` = Pendente
- `[x]` = Completo
- **Bloqueado por**: Task que precisa ser feita antes
- **Prioridade**: High (crítico), Medium (importante), Low (nice-to-have)

