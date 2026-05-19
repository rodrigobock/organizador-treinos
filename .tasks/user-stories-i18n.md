# User Stories - Internacionalização (i18n)

---

## [TASK-I18N-001] Configurar infraestrutura de i18n no frontend React

**Tipo:** Chore  
**Prioridade:** Critical  
**Estimativa:** L (3d)  
**Responsável:** Frontend  

### Descrição
Implementar a infraestrutura base de internacionalização no frontend React usando react-i18next para suportar múltiplos idiomas (PT-BR e EN).

### User Story
Como desenvolvedor, quero configurar a infraestrutura de i18n no React, para que possamos suportar múltiplos idiomas de forma escalável.

### Critérios de Aceitação
- [ ] Biblioteca react-i18next instalada e configurada
- [ ] Estrutura de pastas /src/locales/ criada com pt-br.json e en.json
- [ ] Provider I18nextProvider configurado no App.js
- [ ] Hook useTranslation funcional em todos os componentes
- [ ] Namespace separado por funcionalidade (auth, workouts, exercises, common)
- [ ] Fallback para português brasileiro configurado
- [ ] Build não quebra com a nova configuração

### Definição de Pronto (DoD)
- [ ] Código implementado e funcionando
- [ ] Configuração i18next documentada no README
- [ ] Estrutura de arquivos de tradução definida
- [ ] Exemplo de uso do hook criado
- [ ] Testes unitários para componente com tradução

### Notas Técnicas
- Usar react-i18next como biblioteca principal
- Separar traduções por namespace: auth.json, workouts.json, exercises.json, common.json
- Configurar detecção de idioma via localStorage
- Implementar lazy loading de arquivos de tradução

### Riscos
- Aumenta size do bundle se não configurar code splitting
- Requer refatoração de todos os textos hardcoded

---

## [TASK-I18N-002] Implementar seletor de idioma e persistência da preferência

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** M (1d)  
**Responsável:** Frontend  

### Descrição
Criar componente seletor de idioma no NavBar e implementar persistência da preferência do usuário no localStorage.

### User Story
Como usuário internacional, quero selecionar meu idioma preferido (Português/English), para que o aplicativo seja exibido no idioma que compreendo melhor.

### Critérios de Aceitação
- [ ] Dropdown de idioma visível no NavBar (bandeiras + texto)
- [ ] Opções: "🇧🇷 Português" e "🇺🇸 English"
- [ ] Troca de idioma em tempo real sem reload da página
- [ ] Preferência persistida no localStorage (chave: 'app-language')
- [ ] Idioma padrão definido como português brasileiro
- [ ] Componente responsivo em mobile
- [ ] Estado do idioma atual visível no seletor

### Definição de Pronto (DoD)
- [ ] Componente LanguageSelector implementado
- [ ] Integração com react-i18next funcionando
- [ ] Testes unitários para mudança de idioma
- [ ] UI responsiva testada
- [ ] Persistência validada entre sessões

### Notas Técnicas
- Usar React Bootstrap Dropdown para o seletor
- Integrar com i18n.changeLanguage()
- Adicionar ao NavBar entre Account e Logout
- Usar ISO codes: 'pt-BR', 'en'

### Riscos
- Layout pode quebrar com NavBar muito lotado em mobile

---

## [TASK-I18N-003] Traduzir interface de autenticação

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** M (1d)  
**Responsável:** Frontend  

### Descrição
Traduzir todas as páginas de autenticação: Signin, Signup, ForgotPassword e ResetPassword para inglês.

### User Story
Como usuário internacional, quero que as páginas de login, cadastro e recuperação de senha estejam em inglês, para que eu possa me autenticar facilmente no aplicativo.

### Critérios de Aceitação
- [ ] Página Signin completamente traduzida (títulos, labels, botões, links, mensagens)
- [ ] Página Signup completamente traduzida
- [ ] Página ForgotPassword completamente traduzida
- [ ] Página ResetPassword completamente traduzida
- [ ] Mensagens de erro traduzidas (campos obrigatórios, validação de email)
- [ ] Mensagens de sucesso traduzidas
- [ ] Placeholders dos inputs traduzidos
- [ ] Links entre páginas traduzidos
- [ ] Loading states traduzidos ("Entrando..." → "Signing in...")

### Definição de Pronto (DoD)
- [ ] Todas as strings removidas do código e movidas para arquivos de tradução
- [ ] Arquivo auth.json criado com traduções PT-BR e EN
- [ ] useTranslation implementado em todos os componentes auth
- [ ] Testes de mudança de idioma passando
- [ ] Revisão de tradução por nativo em inglês

### Notas Técnicas
- Namespace: 'auth' para todas as páginas de autenticação
- Manter tone consistente: formal mas amigável
- Cuidado com espaçamento e quebra de layout
- Confirmar traduções com reviewers

### Riscos
- Textos em inglês podem ser mais longos e quebrar layout
- Inconsistência de tom entre páginas

---

## [TASK-I18N-004] Traduzir interface de workouts

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** L (3d)  
**Responsável:** Frontend  

### Descrição
Traduzir todas as páginas relacionadas a workouts: MyWorkouts, NewWorkout, WorkoutDetail para inglês, incluindo ações CRUD.

### User Story
Como usuário internacional, quero que todas as funcionalidades de treinos estejam em inglês, para que eu possa criar, editar e gerenciar meus workouts eficientemente.

### Critérios de Aceitação
- [ ] Página MyWorkouts completamente traduzida (títulos, botões, mensagens vazias)
- [ ] Modal de importação/exportação traduzido
- [ ] Página NewWorkout traduzida (form, validações)
- [ ] Página WorkoutDetail traduzida (exercícios, ações)
- [ ] Botões de ação traduzidos (Criar, Editar, Deletar, Compartilhar)
- [ ] Mensagens de confirmação traduzidas ("Tem certeza que deseja deletar?")
- [ ] Status badges traduzidos ("Público" → "Public")
- [ ] Paginação traduzida ("treinos no total" → "workouts total")
- [ ] Drag & drop labels traduzidos
- [ ] Modal de compartilhamento traduzido

### Definição de Pronto (DoD)
- [ ] Arquivo workouts.json criado com traduções PT-BR e EN
- [ ] useTranslation implementado em todos os componentes workout
- [ ] Pluralização implementada (1 workout vs 2 workouts)
- [ ] Layout testado com textos longos em inglês
- [ ] Testes funcionais de CRUD passando em ambos idiomas

### Notas Técnicas
- Namespace: 'workouts'
- Implementar pluralização com i18next.format()
- Atenção especial para modals e tooltips
- Manter consistência com terminologia fitness internacional

### Riscos
- Modais podem ficar pequenos com textos em inglês
- Terminologia fitness pode variar entre países

---

## [TASK-I18N-005] Internacionalizar mensagens de erro do frontend

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** M (1d)  
**Responsável:** Frontend  

### Descrição
Traduzir todas as mensagens de erro exibidas no frontend, incluindo validações de formulário e erros de API.

### User Story
Como usuário internacional, quero que as mensagens de erro sejam exibidas em inglês, para que eu compreenda os problemas e possa corrigi-los adequadamente.

### Critérios de Aceitação
- [ ] Erros de validação traduzidos ("Preencha todos os campos" → "Please fill all fields")
- [ ] Erros de conexão traduzidos ("Erro ao carregar treinos" → "Error loading workouts")
- [ ] Mensagens de erro genéricas traduzidas
- [ ] Erros de autenticação traduzidos
- [ ] Erros de upload/import traduzidos
- [ ] Timeouts e erros de rede traduzidos
- [ ] Fallback para erro desconhecido em ambos idiomas
- [ ] Consistência no tom das mensagens de erro

### Definição de Pronto (DoD)
- [ ] Arquivo errors.json criado com todas as mensagens
- [ ] Função helper createErrorMessage() implementada
- [ ] Todas as chamadas setError() atualizadas
- [ ] Testes de error handling em ambos idiomas
- [ ] Documentação de padrões de mensagens de erro

### Notas Técnicas
- Namespace: 'errors'
- Criar helper para mapear códigos de erro para traduções
- Manter tom profissional mas empático
- Considerar diferentes níveis de severidade

### Riscos
- Erros do backend podem não ter mapeamento
- Mensagens muito técnicas podem confundir usuário

---

## [TASK-I18N-006] Configurar i18n no backend para mensagens de API

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** L (3d)  
**Responsável:** Backend  

### Descrição
Implementar internacionalização no backend Java/Quarkus para retornar mensagens de erro e resposta no idioma solicitado pelo cliente.

### User Story
Como desenvolvedor frontend, quero que o backend retorne mensagens no idioma correto, para que eu possa exibir feedbacks consistentes ao usuário em sua língua preferida.

### Critérios de Aceitação
- [ ] Header Accept-Language processado pelo backend
- [ ] ResourceBundle configurado para PT-BR e EN
- [ ] GlobalExceptionHandler retorna erros traduzidos
- [ ] Bean Validation messages traduzidas (@NotBlank, @Email)
- [ ] Mensagens de autenticação traduzidas
- [ ] Mensagens de autorização traduzidas
- [ ] Fallback para inglês se idioma não suportado
- [ ] Configuração Quarkus i18n funcional

### Definição de Pronto (DoD)
- [ ] Extensão quarkus-localization configurada
- [ ] Arquivos messages_pt_BR.properties e messages_en.properties criados
- [ ] LocalizationService implementado
- [ ] Todos os Controllers usando mensagens traduzidas
- [ ] Testes de integração validando idiomas
- [ ] Documentação de como adicionar novas traduções

### Notas Técnicas
- Usar @Inject LocalizedString ou ResourceBundle
- Configurar Accept-Language parsing no interceptor
- Separar mensagens por domínio (auth, workouts, validation)
- Usar locale "en" como default internacional

### Riscos
- Performance pode degradar se não configurar cache
- Complexidade aumenta para manter traduções sincronizadas

---

## [TASK-I18N-007] Traduzir templates de email

**Tipo:** Feature  
**Prioridade:** Critical  
**Estimativa:** S (4h)  
**Responsável:** Backend  

### Descrição
Traduzir templates de email (welcome e password reset) para inglês e implementar seleção automática baseada no locale do usuário.

### User Story
Como usuário internacional, quero receber emails de boas-vindas e recuperação de senha em inglês, para que eu compreenda as informações enviadas pelo aplicativo.

### Critérios de Aceitação
- [ ] Template de welcome email traduzido para inglês
- [ ] Template de password reset email traduzido para inglês
- [ ] EmailService detecta idioma preferido do usuário
- [ ] Subject dos emails traduzidos
- [ ] Links nos emails apontam para frontend no idioma correto
- [ ] Fallback para inglês se idioma do usuário não definido
- [ ] Templates HTML responsivos em ambos idiomas

### Definição de Pronto (DoD)
- [ ] Arquivos welcome-email-en.html e reset-password-en.html criados
- [ ] EmailService refatorado para suporte a múltiplos idiomas
- [ ] User entity com campo preferredLanguage (nullable)
- [ ] Testes de envio em ambos idiomas
- [ ] Configuração FRONTEND_URL por idioma

### Notas Técnicas
- Adicionar campo preferred_language na tabela users
- Usar Accept-Language do request de signup como padrão
- Considerar URLs diferentes para frontend em inglês
- Manter branding consistente entre idiomas

### Riscos
- Mudança no schema da base de dados
- Links podem quebrar se não configurados corretamente

---

## [TASK-I18N-008] Traduzir interface de conta do usuário

**Tipo:** Feature  
**Prioridade:** High  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Traduzir a página Account e funcionalidades relacionadas ao perfil do usuário.

### User Story
Como usuário internacional, quero que a página da minha conta esteja em inglês, para que eu possa gerenciar meu perfil facilmente.

### Critérios de Aceitação
- [ ] Página Account completamente traduzida
- [ ] Labels de campos traduzidos (Nome, Email)
- [ ] Botões de ação traduzidos (Salvar, Cancelar)
- [ ] Mensagens de sucesso traduzidas
- [ ] Validações de formulário traduzidas
- [ ] Seção de preferências de idioma (se aplicável)

### Definição de Pronto (DoD)
- [ ] Arquivo account.json criado com traduções
- [ ] useTranslation implementado na página Account
- [ ] Testes funcionais passando
- [ ] Validação de layout com textos longos

### Notas Técnicas
- Namespace: 'account'
- Considerar adicionar seção de preferências de idioma
- Manter consistência com outros formulários

### Riscos
- Baixo risco, página simples

---

## [TASK-I18N-009] Internacionalizar mensagens de validação do backend

**Tipo:** Feature  
**Prioridade:** High  
**Estimativa:** M (1d)  
**Responsável:** Backend  

### Descrição
Traduzir mensagens de validação Bean Validation para inglês e garantir retorno no idioma correto.

### User Story
Como usuário internacional, quero que mensagens de validação de formulário vindas do servidor estejam em inglês, para que eu compreenda os erros de preenchimento.

### Critérios de Aceitação
- [ ] @NotBlank messages traduzidas
- [ ] @Email validation traduzida
- [ ] @Length validation traduzida
- [ ] Custom validators com mensagens i18n
- [ ] ConstraintViolation retornando texto correto
- [ ] Mensagens de negócio traduzidas (email já existe, etc.)

### Definição de Pronto (DoD)
- [ ] ValidationMessages_en.properties criado
- [ ] Todas as anotações usando chaves i18n
- [ ] GlobalExceptionHandler processando locale
- [ ] Testes de validação em ambos idiomas
- [ ] Documentação de padrões de validação

### Notas Técnicas
- Usar Jakarta Bean Validation i18n support
- Configure ValidationMessages.properties
- Implementar LocaleResolver customizado se necessário

### Riscos
- Bean Validation i18n pode ser complexo de configurar

---

## [TASK-I18N-010] Implementar formatação de datas por localização

**Tipo:** Feature  
**Prioridade:** High  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Implementar formatação de datas baseada na localização (PT-BR vs EN-US) em todas as interfaces.

### User Story
Como usuário internacional, quero que as datas sejam exibidas no formato do meu país (MM/DD/YYYY vs DD/MM/YYYY), para que eu compreenda facilmente as informações temporais.

### Critérios de Aceitação
- [ ] Datas formatadas em PT-BR: DD/MM/YYYY
- [ ] Datas formatadas em EN: MM/DD/YYYY
- [ ] Timestamps com formato de hora local
- [ ] Meses escritos por extenso traduzidos
- [ ] Função helper dateFormat() implementada
- [ ] Consistência em todas as telas

### Definição de Pronto (DoD)
- [ ] Utilitário dateFormat.js criado
- [ ] Integração com react-i18next para locale
- [ ] Testes de formatação para ambos formatos
- [ ] Todas as datas da aplicação atualizadas
- [ ] Documentação de padrões de data

### Notas Técnicas
- Usar Intl.DateTimeFormat() para formatação nativa
- Integrar com i18n.language para detectar locale
- Considerar timezone do usuário

### Riscos
- Confusão de usuários com mudanças de formato

---

## [TASK-I18N-011] Traduzir mensagens de sucesso e confirmação

**Tipo:** Feature  
**Prioridade:** High  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Traduzir todas as mensagens de sucesso, confirmação e feedback positivo da aplicação.

### User Story
Como usuário internacional, quero que mensagens de confirmação e sucesso estejam em inglês, para que eu receba feedback claro sobre minhas ações.

### Critérios de Aceitação
- [ ] Mensagens de confirmação traduzidas ("Treino criado com sucesso")
- [ ] Alerts de confirmação traduzidos ("Tem certeza?")
- [ ] Toasts de sucesso traduzidos
- [ ] Mensagens de import/export traduzidas
- [ ] Feedback de compartilhamento traduzido
- [ ] Mensagens de estado traduzidas ("Carregando...")

### Definição de Pronto (DoD)
- [ ] Arquivo feedback.json criado com traduções
- [ ] Todas as mensagens positivas mapeadas
- [ ] Testes de fluxos completos em ambos idiomas
- [ ] Consistência de tom validada

### Notas Técnicas
- Namespace: 'feedback'
- Manter tom positivo e encorajador
- Padronizar formato de mensagens de sucesso

### Riscos
- Baixo risco, principalmente texto

---

## [TASK-I18N-012] Detectar idioma do navegador como padrão

**Tipo:** Feature  
**Prioridade:** Medium  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Implementar detecção automática do idioma preferido do navegador para configurar idioma padrão.

### User Story
Como usuário internacional, quero que o aplicativo detecte automaticamente meu idioma preferido do navegador, para que eu não precise configurar manualmente.

### Critérios de Aceitação
- [ ] navigator.language detectado na primeira visita
- [ ] Fallback para inglês se idioma não suportado
- [ ] Usuário pode sobrescrever detecção automática
- [ ] Preferência manual sempre tem prioridade sobre detecção
- [ ] Funciona em diferentes navegadores

### Definição de Pronto (DoD)
- [ ] Função detectBrowserLanguage() implementada
- [ ] Integração com i18next LanguageDetector
- [ ] Testes em diferentes configurações de navegador
- [ ] Documentação do comportamento de detecção

### Notas Técnicas
- Usar i18next-browser-languagedetector
- Configure ordem: localStorage → navigator → fallback
- Mapear códigos de idioma (pt, pt-BR → pt-BR)

### Riscos
- Pode confundir usuários se detecção for incorreta

---

## [TASK-I18N-013] Implementar pluralização dinâmica para contadores

**Tipo:** Feature  
**Prioridade:** Medium  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Implementar pluralização automática para contadores e textos que variam com quantidade.

### User Story
Como usuário, quero que textos de contagem sejam gramaticalmente corretos em ambos idiomas ("1 treino" vs "2 treinos", "1 workout" vs "2 workouts").

### Critérios de Aceitação
- [ ] Pluralização PT-BR implementada (treino/treinos, exercício/exercícios)
- [ ] Pluralização EN implementada (workout/workouts, exercise/exercises)
- [ ] Contadores dinâmicos funcionando
- [ ] Zero, um e múltiplos tratados corretamente
- [ ] Integração com react-i18next plurals

### Definição de Pronto (DoD)
- [ ] Configuração de pluralização do i18next
- [ ] Arquivo plurals.json criado
- [ ] Helper usePlural() implementado
- [ ] Todos os contadores atualizados
- [ ] Testes de pluralização

### Notas Técnicas
- Usar i18next plural forms
- Configurar regras PT-BR e EN
- Testar casos edge (0, 1, 2, 11, etc.)

### Riscos
- Regras de pluralização podem ser complexas

---

## [TASK-I18N-014] Adicionar direção de texto (RTL) para futuras expansões

**Tipo:** Spike  
**Prioridade:** Medium  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Preparar aplicação para suporte futuro a idiomas RTL (Right-to-Left) como árabe ou hebraico.

### User Story
Como produto que pode expandir globalmente, queremos preparar a base técnica para idiomas RTL, para que futuras expansões sejam mais fáceis.

### Critérios de Aceitação
- [ ] CSS preparado para direção RTL
- [ ] Componentes testados com dir="rtl"
- [ ] Layout não quebra com texto RTL
- [ ] Ícones e posicionamento flexíveis
- [ ] Documentação de guidelines RTL

### Definição de Pronto (DoD)
- [ ] Análise de compatibilidade RTL concluída
- [ ] Documentação de preparação RTL
- [ ] CSS utilities para RTL criados
- [ ] Testes de layout RTL realizados
- [ ] Roadmap para implementação futura

### Notas Técnicas
- Usar CSS logical properties (margin-inline-start)
- Testar com Chrome DevTools RTL
- Considerar bibliotecas como react-with-direction

### Riscos
- Pode ser over-engineering para MVP
- Tempo investido pode não ter retorno

---

## [TASK-I18N-015] Criar documentação de tradução para contribuidores

**Tipo:** Chore  
**Prioridade:** Medium  
**Estimativa:** S (4h)  
**Responsável:** Frontend  

### Descrição
Criar documentação completa do sistema de tradução para facilitar contribuições futuras.

### User Story
Como desenvolvedor futuro ou contribuidor, quero documentação clara do sistema de i18n, para que eu possa adicionar novos idiomas ou manter traduções facilmente.

### Critérios de Aceitação
- [ ] README de i18n com guia completo
- [ ] Documentação de estrutura de arquivos
- [ ] Guia de como adicionar novo idioma
- [ ] Guia de como atualizar traduções
- [ ] Exemplos de uso do useTranslation
- [ ] Checklist de QA para traduções

### Definição de Pronto (DoD)
- [ ] Arquivo TRANSLATION.md criado
- [ ] Seção i18n adicionada ao README principal
- [ ] Templates de PR para traduções
- [ ] Guia de revisão de traduções
- [ ] Scripts automatizados documentados

### Notas Técnicas
- Incluir convenções de nomenclatura
- Documentar namespaces e organização
- Criar templates para novos idiomas

### Riscos
- Documentação pode ficar desatualizada

---

## Definição de Pronto Global para MVP i18n

### Must Have (Critério de Aceitação do Épico)
- [ ] Aplicação 100% funcional em português brasileiro
- [ ] Aplicação 100% funcional em inglês
- [ ] Seletor de idioma funcional no NavBar
- [ ] Preferência de idioma persistida entre sessões
- [ ] Backend retorna mensagens no idioma correto
- [ ] Emails enviados no idioma preferido do usuário
- [ ] Zero strings hardcoded no código
- [ ] Performance não impactada significativamente
- [ ] Testes de regressão passando em ambos idiomas
- [ ] Deploy sem breaking changes

### Nice to Have
- [ ] Detecção automática de idioma do navegador
- [ ] Pluralização perfeita
- [ ] Formatação de datas por locale
- [ ] Documentação completa para contribuidores

## Critérios de Qualidade

### Performance
- [ ] Bundle size não aumenta mais que 15%
- [ ] First load time mantido
- [ ] Lazy loading de traduções implementado

### UX/UI
- [ ] Layout não quebra com textos longos
- [ ] Transição suave entre idiomas
- [ ] Consistência visual mantida
- [ ] Acessibilidade preservada

### Manutenibilidade
- [ ] Código i18n bem estruturado
- [ ] Traduções organizadas logicamente
- [ ] Fácil adição de novos idiomas
- [ ] CI/CD adaptado para i18n