# Backlog - Organizador de Treinos

## Épico: Internacionalização (i18n)

**Objetivo:** Tornar o aplicativo disponível em inglês além do português brasileiro atual.

**Valor de Negócio:** Expandir a base de usuários para mercados internacionais de língua inglesa.

**Escopo:** Frontend React + Backend Java + Templates de email

---

## Tasks Priorizadas (Phase 4.5 - i18n MVP)

### CRITICAL (Must Have para i18n MVP)

- [TASK-I18N-001] Configurar infraestrutura de i18n no frontend React
- [TASK-I18N-002] Implementar seletor de idioma e persistência da preferência
- [TASK-I18N-003] Traduzir interface de autenticação (Signin, Signup, ForgotPassword, ResetPassword)
- [TASK-I18N-004] Traduzir interface de workouts (MyWorkouts, NewWorkout, WorkoutDetail)
- [TASK-I18N-005] Internacionalizar mensagens de erro do frontend
- [TASK-I18N-006] Configurar i18n no backend para mensagens de API
- [TASK-I18N-007] Traduzir templates de email (welcome + password reset)

### HIGH (Should Have)

- [TASK-I18N-008] Traduzir interface de conta do usuário (Account page)
- [TASK-I18N-009] Internacionalizar mensagens de validação do backend
- [TASK-I18N-010] Implementar formatação de datas por localização
- [TASK-I18N-011] Traduzir mensagens de sucesso e confirmação

### MEDIUM (Nice to Have)

- [TASK-I18N-012] Detectar idioma do navegador como padrão
- [TASK-I18N-013] Implementar pluralização dinâmica para contadores
- [TASK-I18N-014] Adicionar direção de texto (RTL) para futuras expansões
- [TASK-I18N-015] Criar documentação de tradução para contribuidores

### LOW (Future)

- [TASK-I18N-016] Adicionar mais idiomas (Espanhol, Francês)
- [TASK-I18N-017] Implementar tradução automática para conteúdo gerado pelo usuário
- [TASK-I18N-018] Otimizar bundle splitting por idioma

---

## Estimativas

- **Total Critical:** ~3-4 semanas
- **Total High:** ~1-2 semanas  
- **Total Medium:** ~1 semana
- **MVP i18n:** ~5-6 semanas

## Dependências

- Todas as tasks dependem de TASK-I18N-001 (infraestrutura)
- Tasks de backend (006, 009) podem ser desenvolvidas em paralelo
- Templates de email (007) dependem da conclusão do backend i18n

## Riscos

- Quebra de layout com textos mais longos em inglês
- Necessidade de refatoração de componentes hardcoded
- Configuração complexa de build para múltiplos idiomas