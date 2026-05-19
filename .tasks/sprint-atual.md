# Sprint Atual - Internacionalização MVP

## Sprint 1: Infraestrutura e Fundação (5 dias úteis)

**Período:** Semana 1  
**Objetivo:** Estabelecer base técnica para i18n e implementar seletor de idioma  
**Equipe:** Frontend Dev + Backend Dev  

---

## Tasks em Andamento

### 🚧 [TASK-I18N-001] Configurar infraestrutura de i18n no frontend React

**Responsável:** @agent-frontend-dev  
**Status:** Ready to Start  
**Prioridade:** CRITICAL  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma  

**Próximos Passos:**
1. Instalar react-i18next e dependências
2. Configurar I18nextProvider no App.js
3. Criar estrutura /src/locales/ com arquivos base
4. Implementar hook useTranslation
5. Testar mudança de idioma básica

---

### 🚧 [TASK-I18N-002] Implementar seletor de idioma e persistência da preferência

**Responsável:** @agent-frontend-dev  
**Status:** Blocked by TASK-I18N-001  
**Prioridade:** CRITICAL  
**Estimativa:** 1 dia  
**Dependências:** TASK-I18N-001  

**Próximos Passos:**
1. Criar componente LanguageSelector
2. Adicionar ao NavBar
3. Implementar persistência no localStorage
4. Testar mudança em tempo real

---

### 🚧 [TASK-I18N-006] Configurar i18n no backend para mensagens de API

**Responsável:** @agent-backend-dev  
**Status:** Ready to Start  
**Prioridade:** CRITICAL  
**Estimativa:** 3 dias  
**Dependências:** Nenhuma  

**Próximos Passos:**
1. Configurar quarkus-localization extension
2. Criar arquivos messages_pt_BR.properties e messages_en.properties
3. Implementar LocalizationService
4. Atualizar GlobalExceptionHandler
5. Testar Accept-Language processing

---

## Critério de Sucesso do Sprint

### Must Have
- [ ] Usuário pode alternar entre PT-BR e English na interface
- [ ] Preferência de idioma é salva entre sessões
- [ ] Backend processa Accept-Language e retorna mensagens traduzidas
- [ ] Infraestrutura suporta adição fácil de novas traduções
- [ ] Zero breaking changes em funcionalidade existente

### Nice to Have
- [ ] Documentação técnica básica pronta
- [ ] Performance baseline estabelecida
- [ ] Primeiras traduções de exemplo funcionando

---

## Blockers e Riscos

### Possíveis Blockers
- Configuração do Quarkus i18n mais complexa que esperado
- Bundle size impacto maior que previsto
- Conflicts com código existente

### Plano de Mitigação
- Fazer spike técnico no primeiro dia
- Monitorar bundle size desde o início
- Fazer backup branch antes de mudanças grandes

---

## Definition of Ready

Para uma task ser iniciada, deve ter:
- [ ] Critérios de aceitação claros
- [ ] Dependências identificadas e resolvidas
- [ ] Estimativa validada pelo desenvolvedor
- [ ] Ambiente de desenvolvimento preparado

## Definition of Done

Para uma task ser considerada completa, deve ter:
- [ ] Código implementado e funcionando
- [ ] Testes unitários escritos (cobertura mínima 80%)
- [ ] Code review aprovado
- [ ] Análise de segurança realizada (se aplicável)
- [ ] Deploy em staging validado pelo QA
- [ ] Documentação atualizada
- [ ] Zero regressões funcionais

---

## Next Sprint Preview

**Sprint 2 (Semana 2):** Foco em autenticação e core flows
- Traduzir páginas de auth (Signin, Signup, ForgotPassword)
- Implementar templates de email i18n
- Traduzir mensagens de erro principais

**Tasks Preparando:**
- [TASK-I18N-003] Traduzir interface de autenticação
- [TASK-I18N-005] Internacionalizar mensagens de erro do frontend
- [TASK-I18N-007] Traduzir templates de email