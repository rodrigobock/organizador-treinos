# Guidelines de Tradução - Organizador de Treinos

## Princípios Gerais

### Tom e Voz
- **Tom:** Profissional mas amigável, motivacional
- **Voz:** Direta, clara, encorajadora
- **Público:** Pessoas que praticam exercícios físicos (iniciantes a avançados)

### Consistência Terminológica
- Manter consistência entre diferentes telas
- Usar terminologia fitness padrão internacional
- Evitar gírias ou expressões muito regionais

---

## Dicionário de Termos

### Core Concepts

| PT-BR | EN | Notas |
|-------|----|----|
| Treino | Workout | Nunca "Training" |
| Exercício | Exercise | Sempre singular/plural correto |
| Série | Set | No contexto de repetições |
| Repetição | Rep / Repetition | "Rep" em contextos casuais |
| Carga | Weight | Quando se refere a peso |
| Descanso | Rest | Período entre séries |
| Completado | Completed | Status de exercício |
| Público | Public | Visibilidade do treino |
| Compartilhar | Share | Ação de compartilhamento |
| Proprietário | Owner | Dono do treino |

### Interface Elements

| PT-BR | EN | Notas |
|-------|----|----|
| Entrar | Sign In | Nunca "Login" como verbo |
| Cadastrar-se | Sign Up | |
| Sair | Sign Out | Nunca "Logout" como verbo |
| Bem-vindo de volta | Welcome back | |
| Meus Treinos | My Workouts | |
| Novo Treino | New Workout | |
| Editar | Edit | |
| Deletar | Delete | Nunca "Remove" para ação destrutiva |
| Salvar | Save | |
| Cancelar | Cancel | |
| Confirmar | Confirm | |
| Carregando... | Loading... | Sempre com "..." |
| Erro | Error | |
| Sucesso | Success | |

### Authentication Flow

| PT-BR | EN | Notas |
|-------|----|----|
| E-mail | Email | Sem hífen |
| Senha | Password | |
| Esqueceu a senha? | Forgot password? | |
| Redefinir senha | Reset password | |
| Nova senha | New password | |
| Confirmar senha | Confirm password | |
| Não tem conta? | Don't have an account? | |
| Registre-se | Sign up | |
| Criar conta | Create account | |

---

## Exemplos de Frases Completas

### Mensagens de Sucesso
```
PT-BR: "Treino criado com sucesso!"
EN:    "Workout created successfully!"

PT-BR: "Exercício adicionado ao treino."
EN:    "Exercise added to workout."

PT-BR: "Suas alterações foram salvas."
EN:    "Your changes have been saved."
```

### Mensagens de Erro
```
PT-BR: "Preencha todos os campos obrigatórios."
EN:    "Please fill in all required fields."

PT-BR: "Erro ao carregar treinos. Tente novamente."
EN:    "Error loading workouts. Please try again."

PT-BR: "Não foi possível deletar o treino."
EN:    "Unable to delete workout."
```

### Confirmações
```
PT-BR: "Tem certeza que deseja deletar este treino?"
EN:    "Are you sure you want to delete this workout?"

PT-BR: "Esta ação não pode ser desfeita."
EN:    "This action cannot be undone."

PT-BR: "Deseja sair sem salvar?"
EN:    "Do you want to leave without saving?"
```

### Estados de Loading
```
PT-BR: "Carregando treinos..."
EN:    "Loading workouts..."

PT-BR: "Salvando..."
EN:    "Saving..."

PT-BR: "Entrando..."
EN:    "Signing in..."

PT-BR: "Criando conta..."
EN:    "Creating account..."
```

---

## Padrões de Pluralização

### Português Brasileiro
```
1 treino
2 treinos
0 treinos

1 exercício  
2 exercícios
0 exercícios
```

### English
```
1 workout
2 workouts
0 workouts

1 exercise
2 exercises  
0 exercises
```

### Implementação i18next
```json
{
  "workoutCount_one": "{{count}} treino",
  "workoutCount_other": "{{count}} treinos",
  "workoutCount_zero": "Nenhum treino"
}
```

---

## Email Templates

### Welcome Email

**Subject PT-BR:** "Bem-vindo ao Organizador de Treinos!"  
**Subject EN:** "Welcome to Workout Organizer!"

**Body PT-BR:**
```
Olá {{name}},

Bem-vindo ao Organizador de Treinos! 

Sua conta foi criada com sucesso. Agora você pode:
• Criar e organizar seus treinos
• Adicionar exercícios personalizados  
• Compartilhar treinos com amigos
• Acompanhar seu progresso

Comece criando seu primeiro treino!

Bons treinos,
Equipe Organizador de Treinos
```

**Body EN:**
```
Hello {{name}},

Welcome to Workout Organizer!

Your account has been created successfully. Now you can:
• Create and organize your workouts
• Add custom exercises
• Share workouts with friends  
• Track your progress

Get started by creating your first workout!

Happy training,
Workout Organizer Team
```

### Password Reset Email

**Subject PT-BR:** "Redefinir sua senha - Organizador de Treinos"  
**Subject EN:** "Reset your password - Workout Organizer"

---

## Tratamento de Gênero

### Português
- Usar linguagem neutra quando possível: "usuário" ao invés de "usuário/usuária"
- Para textos direcionados: "Bem-vindo(a)" é aceitável em contextos informais

### English
- Evitar pronomes quando possível
- Usar "you" sempre que possível
- "User" é neutro por padrão

---

## Formatação e Pontuação

### Números e Datas
```
PT-BR: 15/03/2024 (DD/MM/YYYY)
EN:    03/15/2024 (MM/DD/YYYY)

PT-BR: 1.500 exercícios
EN:    1,500 exercises
```

### Botões e CTAs
```
PT-BR: "Criar Treino"     (Title Case apenas primeira palavra)
EN:    "Create Workout"   (Title Case)

PT-BR: "Salvar alterações"  (Sentence case)
EN:    "Save Changes"       (Title Case)
```

### Labels de Form
```
PT-BR: "Nome do treino:"   (Com dois pontos)
EN:    "Workout name"      (Sem dois pontos)

PT-BR: "E-mail"
EN:    "Email"
```

---

## Contextos Específicos

### Workout Sharing
```
PT-BR: "Compartilhado por {{userName}}"
EN:    "Shared by {{userName}}"

PT-BR: "Você tem permissão de leitura"
EN:    "You have read access"

PT-BR: "Você pode editar este treino"  
EN:    "You can edit this workout"
```

### Import/Export
```
PT-BR: "Exportar JSON"
EN:    "Export JSON"

PT-BR: "Importar treinos"
EN:    "Import workouts"

PT-BR: "Arquivo importado com sucesso"
EN:    "File imported successfully"
```

### Accessibility
```
PT-BR: "Editar treino"     (aria-label)
EN:    "Edit workout"      (aria-label)

PT-BR: "Excluir exercício"
EN:    "Delete exercise"
```

---

## Checklist de Qualidade

### Para cada tradução, verificar:
- [ ] Tom consistente com guidelines
- [ ] Terminologia correta conforme dicionário
- [ ] Pluralização implementada onde necessário
- [ ] Layout não quebra com texto mais longo
- [ ] Acessibilidade mantida (labels, aria)
- [ ] Contexto adequado (formal vs informal)
- [ ] Sem typos ou erros gramaticais
- [ ] Consistência com outras partes do app

### Testes de Qualidade
- [ ] Testar em telas pequenas (mobile)
- [ ] Verificar overflow de texto
- [ ] Validar com usuários nativos
- [ ] Confirmar compreensibilidade
- [ ] Testar fluxos completos em ambos idiomas

---

## Ferramentas Recomendadas

### Para Validação
- **Grammarly:** Correção gramatical em inglês
- **LanguageTool:** Correção em português
- **Google Translate:** Apenas para inspiração, nunca cópia direta

### Para Testes
- **Chrome DevTools:** Simular diferentes locales
- **BrowserStack:** Testar em diferentes navegadores/OS
- **Screen Readers:** Validar acessibilidade traduzida

---

## Processo de Review

1. **Self-review:** Desenvolvedor valida própria tradução
2. **Technical review:** Code review normal
3. **Language review:** Nativo valida qualidade da tradução
4. **User testing:** Teste com usuários reais em staging
5. **Final approval:** Product Owner aprova para produção