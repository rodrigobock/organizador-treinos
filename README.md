# organizador-treinos

App web para organizar e gerenciar treinos. Usuários criam workouts com exercícios, marcam progresso, compartilham treinos com outros.

## Propósito

Ferramenta simples para:
- ✅ Criar e editar workouts (conjuntos de exercícios)
- ✅ Adicionar/remover exercícios, marcar conclusão
- ✅ Compartilhar workouts com amigos (permissões READ/EDIT)
- ✅ Autenticação com JWT + email de recuperação de senha
- ✅ Exportar workouts como JSON (client-side)

## Stack Técnico

### Backend
- **Java 17** + **Quarkus 3.9.1** — lightweight REST framework
- **PostgreSQL** + **Liquibase** — schema versioning automático
- **Hibernate Panache** — ORM simplificado
- **SmallRye JWT** + **BCrypt** — auth segura
- **Resend SDK** — envio de email para welcome + password reset
- **Maven** — build tool

### Frontend
- **React 18** + **React Router v6** — SPA com routing
- **Bootstrap 5** + **Styled Components** — UI responsiva
- **Axios** — HTTP client com interceptor JWT
- **Context API** — state global (auth, user)
- **npm** — package manager

## Arquitetura

```
organizador-treinos/
├── organizador-treinos-back-end/    # Quarkus REST API
│   ├── src/main/java/.../
│   │   ├── controller/               # HTTP endpoints
│   │   ├── service/                  # business logic
│   │   ├── repository/               # data access (Panache)
│   │   ├── entity/                   # JPA entities
│   │   ├── dto/                      # request/response
│   │   └── exception/                # error handling
│   ├── src/main/resources/db/        # Liquibase migrations
│   └── pom.xml
│
└── organizador-treinos-front-end/   # React SPA
    ├── src/
    │   ├── pages/                    # Signin, Signup, MyWorkouts, etc.
    │   ├── services/                 # API calls (authService, workoutService)
    │   ├── contexts/                 # AuthContext (user + token)
    │   ├── components/               # Reusable UI components
    │   └── routes/                   # React Router config
    └── package.json
```

### Fluxo de Funcionamento

1. **Auth**: Signup cria user (email + senha hashed com BCrypt) + JWT token + email de boas-vindas
2. **Login**: Email/senha → valida → retorna JWT (armazenado em localStorage)
3. **Workouts**: CRUD de workouts (user pode criar, listar, editar, deletar seus workouts)
4. **Exercises**: CRUD de exercises dentro de workouts (adicionar exercícios, marcar completado)
5. **Sharing**: Workout owner pode compartilhar com outro user (READ = visualizar, EDIT = editar)
6. **Autenticação**: JWT token enviado em cada request (`Authorization: Bearer <token>`)

## Quick Start

### Backend
```bash
cd organizador-treinos-back-end

# Dev mode (auto-reload)
mvn quarkus:dev

# Tests
mvn test

# Production build
mvn clean package
```

### Frontend
```bash
cd organizador-treinos-front-end

# Dev server (http://localhost:3000)
npm start

# Tests
npm test

# Production build
npm run build
```

### Ambos simultâneos
```bash
# Terminal 1
cd organizador-treinos-back-end && mvn quarkus:dev

# Terminal 2
cd organizador-treinos-front-end && npm start
```

**Env vars necessárias** (backend):
- `RESEND_API_KEY` — API key do Resend (email)
- `FROM_EMAIL` — endereço de envio (ex: `noreply@domain.com`)
- `FRONTEND_URL` — URL frontend para links de reset de senha (ex: `http://localhost:3000`)

## API Endpoints

### Auth
- `POST /auth/signup` — Cria user + retorna JWT + envia welcome email
- `POST /auth/login` — Email/senha → JWT
- `POST /auth/forgot-password` — Gera token UUID com 1h TTL + envia email reset (sempre 200)
- `POST /auth/reset-password` — Valida token UUID + atualiza senha

### User
- `GET /users/me` — Retorna dados do user autenticado
- `PUT /users/me` — Atualiza nome/perfil

### Workouts
- `GET /workouts` — Lista workouts do user (próprios + compartilhados)
- `POST /workouts` — Cria novo workout
- `GET /workouts/{id}` — Detalhe de workout
- `PUT /workouts/{id}` — Edita workout (owner only)
- `DELETE /workouts/{id}` — Deleta workout (owner only)

### Exercises
- `POST /workouts/{id}/exercises` — Adiciona exercise
- `PATCH /workouts/{id}/exercises/{exerciseId}` — Marca completo/incompleto
- `DELETE /workouts/{id}/exercises/{exerciseId}` — Remove exercise

### Sharing
- `POST /workouts/{id}/share` — Compartilha workout com user (READ/EDIT)
- `GET /workouts/shared` — Lista workouts compartilhados com você

## Segurança

✅ **Implementado**:
- JWT com RSA signing (private key para sign, public para verify)
- BCrypt para password hashing (salt gerado automaticamente)
- Reset tokens: UUID securo com 1h TTL + single-use (invalidado se novo reset solicitado)
- Anti-enumeration: forgot-password sempre retorna 200, login retorna erro genérico
- Authorization: todo acesso a workout/exercise valida owner ou compartilhamento
- CORS configurável (frontend/backend em origins diferentes)

⚠️ **Conhecidos/Pendentes**:
- **Sem rate limiting** em endpoints de auth (atualmente qualquer IP pode tentar infinito signup/login/forgot-password)
- **Token em localStorage** (XSS vulnerability se site tiver vulnerabilidade); alternativa: httpOnly cookies (requer backend config)
- **Sem refresh tokens** — token não expira, usuário logged in indefinidamente
- **Email service transa boundaries** — welcome email enviado DENTRO de @Transactional; se rollback ocorrer após send, email já foi entregue (low risk, mas não ideal)

## Bugs Conhecidos

1. **Success message pós-reset não aparece**: ResetPassword navega com `state: { message: "..." }` mas Signin não lê `useLocation()` — mensagem é perdida
2. **Paginação inexistente**: MyWorkouts carrega TODOS os workouts do user (sem limite) — pode ser lento com muitos treinos
3. **Sem loading states**: UI não mostra feedback de loading durante requisições (espera sincronamente)
4. **Empty states não claros**: Se user não tiver workouts, interface fica em branco sem mensagem

## Roadmap

### Phase 4: Export Functionality ⏳
- ✅ Botão "Exportar JSON" (client-side, 100% no browser)
- [ ] Backend endpoint para export (se necessário)
- [ ] PDF export (não começado; opções: iText, PDFBox)

### Phase 5: Polishing ⏳
- [ ] Rate limiting em auth endpoints
- [ ] Refresh tokens + token rotation
- [ ] Success message pós-reset (fix do bug acima)
- [ ] Paginação em MyWorkouts
- [ ] Loading states + empty states
- [ ] Change password endpoint (`PUT /users/me/password`)
- [ ] Delete account endpoint (`DELETE /users/me`)

## Desenvolvimento

Ver [CLAUDE.md](./CLAUDE.md) para:
- Estrutura detalhada de controllers/services/repos
- Comandos Maven/npm específicos
- Como adicionar novo endpoint/página
- Config de teste, build, deployment

## Stack Resumido

| Aspecto | Tech |
|---------|------|
| Backend Language | Java 17 |
| Backend Framework | Quarkus 3.9.1 |
| Database | PostgreSQL + Liquibase |
| Auth | JWT (RSA) + BCrypt |
| Email | Resend SDK |
| Frontend Framework | React 18 |
| Frontend Routing | React Router v6 |
| HTTP Client | Axios |
| UI Framework | Bootstrap 5 |
| State Management | Context API |
| Testing (Backend) | JUnit5 + REST Assured |
| Testing (Frontend) | Jest + React Testing Library |

## License

MIT (ou especificar conforme necessário)
