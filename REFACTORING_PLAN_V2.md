# 🏗️ Plano de Refatoração Incremental - GED IRIS

## 🎯 **Estratégia: Refatoração Gradual e Segura**

### **Lição Aprendida:**
A tentativa anterior de refatoração foi muito agressiva, movendo muitos componentes simultaneamente e criando dependências quebradas. 

### **Nova Abordagem: Baby Steps**

## 📋 **FASE 1: ESTABILIZAÇÃO ATUAL (1 semana)**

### **Passo 1.1: Análise Detalhada**
- [ ] Mapear TODAS as dependências entre componentes
- [ ] Identificar imports e exports
- [ ] Documentar estrutura atual detalhadamente
- [ ] Verificar funcionamento atual do projeto

### **Passo 1.2: Correções Pontuais**
- [ ] Corrigir erros de build existentes
- [ ] Padronizar imports relativos vs absolutos
- [ ] Limpar código não utilizado
- [ ] Garantir que projeto buildo e rode

## 📋 **FASE 2: PREPARAÇÃO PARA DOMÍNIOS (2 semanas)**

### **Passo 2.1: Criar Estrutura Base (sem mover arquivos)**
```
src/app/
├── core/                    # Apenas criar pastas, sem mover ainda
├── shared/                  # Manter estrutura atual
├── domains/                 # Nova pasta para futuras features
└── legacy/                  # Para componentes que serão migrados
```

### **Passo 2.2: Path Mapping no TypeScript**
- [ ] Configurar paths no tsconfig.json
- [ ] Criar aliases para facilitar imports futuros
- [ ] Testar que não quebrou nada

### **Passo 2.3: Barrel Exports (index.ts)**
- [ ] Criar index.ts em cada pasta relevante
- [ ] Centralizar exports
- [ ] Simplificar imports gradualmente

## 📋 **FASE 3: CRIAÇÃO DE DOMÍNIOS (3 semanas)**

### **Passo 3.1: Identificar Domínios Reais**
Baseado no código atual, os domínios são:

1. **Document Management**
   - `document-manager.component`
   - `document-manager-refactored.component`
   - `insert-document.component`
   - `inserir-arquivos.component`

2. **Search & Discovery**
   - `dashboard.component`
   - `document-search.component`

3. **Core Services**
   - `ged.api.service`
   - `document.service`
   - `document-search.service`
   - `auth.service`

4. **Shared UI**
   - `tool-bar.component`
   - `editor-html.component`

### **Passo 3.2: Criar Domínio por Vez**
**Começar com o menor: Search Domain**

- [ ] Criar `src/app/domains/search/`
- [ ] Criar módulo search
- [ ] Copiar (não mover) dashboard.component
- [ ] Ajustar imports no novo local
- [ ] Testar funcionamento
- [ ] Atualizar uma rota por vez

### **Passo 3.3: Aplicar para Próximo Domínio**
Repetir processo para Document Management

## 📋 **FASE 4: LAZY LOADING (1 semana)**

### **Passo 4.1: Configurar Lazy Loading Gradual**
- [ ] Converter primeiro domínio para lazy loading
- [ ] Testar performance
- [ ] Aplicar para outros domínios

## 📋 **FASE 5: LIMPEZA (1 semana)**

### **Passo 5.1: Remover Código Legacy**
- [ ] Mover arquivos antigos para /legacy
- [ ] Atualizar imports finais
- [ ] Remover pastas antigas
- [ ] Documentar nova estrutura

## ⚠️ **REGRAS DE SEGURANÇA**

1. **Um componente por vez**: Nunca mover mais de 1 componente simultaneamente
2. **Sempre testar**: Build + run após cada mudança
3. **Backup**: Commit antes de cada passo
4. **Rollback rápido**: Se algo quebrar, reverter imediatamente
5. **Validação**: Testar todas as funcionalidades após cada fase

## 🔍 **ANÁLISE ATUAL NECESSÁRIA**

Antes de começar, preciso entender:

1. **Dependências**: Quem importa o quê?
2. **Serviços**: Como estão sendo injetados?
3. **Rotas**: Como estão configuradas?
4. **Módulos**: Estrutura atual de imports/exports
5. **Build**: Por que não está funcionando?

## 🎯 **PRIORIDADE IMEDIATA**

1. ✅ Fazer o projeto buildar e rodar
2. 📝 Mapear dependências completas
3. 🧹 Limpar problemas existentes
4. 📋 Planejar primeiro passo incremental