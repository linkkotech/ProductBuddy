# 🔧 PLANO DE EXECUÇÃO: SUMARIZAÇÃO PROGRESSIVA

**Data:** 3 de Novembro de 2025  
**Prioridade:** 🔴 CRÍTICA  
**Status:** ⏳ Aguardando Aprovação  
**Impacto:** Resolve bug de token limit em conversas longas (8+ seções)

---

## 1. ANÁLISE DO PROBLEMA

### Bug Identificado
```
❌ ESTADO ATUAL (Quebrado):
Chat com 8-10 seções → Histórico completo → gemini-2.5-pro sumariza TUDO de uma vez
→ Histórico muito grande → Exceeds token limit → Falha na geração

🟢 ESTADO DESEJADO (Proposto):
Seção 1 validada → Extração incremental → prdSectionData.visao_geral atualizado
Seção 2 validada → Extração incremental → prdSectionData.escopo atualizado
...
Seção 10 validada → Extração incremental → prdSectionData.questoes_abertas atualizado
→ Geração final = sem análise massiva → Sem exceder token limit
```

### Causa Raiz
- Prompt enviava TODA a conversa (10 seções de discussão) para extração única
- Gemini 2.5 Pro com limites de token não conseguia processar tudo
- Overhead desnecessário: análise de contexto já adquirido várias vezes

### Solução
- **Sumarização Incremental:** Extrair seção-por-seção assim que validada
- **Menor Payload:** Cada chamada envolve apenas 1 seção (não 10)
- **Eficiência:** Gemini processa muito mais rápido
- **Sem Token Bloat:** Geração final usa dados já processados

---

## 2. PLANO DE EXECUÇÃO EM ETAPAS

### 📋 ETAPA 1: Criar Novo Serviço de Extração Incremental
**Arquivo:** `services/geminiService.ts`  
**Tempo Estimado:** 15-20 minutos

#### Tarefa 1.1: Adicionar Nova Função `extractSectionContent`
```typescript
/**
 * Extrai o conteúdo de UMA ÚNICA seção do PRD baseado no histórico da conversa.
 * @param conversationHistory - Array de objetos Content com histórico do chat
 * @param sectionName - Nome da seção (ex: "Visão Geral", "Personas", etc)
 * @returns Promise<string | null> - Conteúdo extraído ou null em caso de erro
 */
export const extractSectionContent = async (
  conversationHistory: any[], // Content[]
  sectionName: string
): Promise<string | null> => {
  // Implementação aqui
}
```

**Responsabilidades:**
- ✅ Usar `gemini-2.5-pro` modelo
- ✅ Aceitar histórico de conversa + nome da seção
- ✅ Enviar prompt específico para 1 seção
- ✅ Forçar resposta JSON com schema `{ sectionContent: string }`
- ✅ Retornar string pura (sectionContent) ou null
- ✅ Error handling com try-catch e console.error

**Prompt Internal:**
```
Analise o histórico da conversa abaixo e extraia um resumo completo, bem 
estruturado e profissional para a seção do PRD intitulada: "${sectionName}".

Histórico da Conversa:
[conversa aqui]

Retorne APENAS o conteúdo desta seção em um JSON estruturado. Não inclua o 
nome da seção, apenas seu conteúdo completo.
```

**Schema JSON:**
```typescript
const sectionSchema = {
  type: Type.OBJECT,
  properties: {
    sectionContent: { type: Type.STRING }
  },
  required: ['sectionContent']
};
```

---

### 📋 ETAPA 2: Criar Validador de Seção
**Arquivo:** `services/geminiService.ts` (mesma localização)  
**Tempo Estimado:** 10-15 minutos

#### Tarefa 2.1: Adicionar Nova Função `isSectionValidatedByUser`
```typescript
/**
 * Detecta se a última mensagem do usuário indica aprovação da seção.
 * @param lastUserMessage - Última mensagem enviada pelo usuário
 * @returns Promise<boolean> - True se validado, false caso contrário
 */
export const isSectionValidatedByUser = async (
  lastUserMessage: string
): Promise<boolean> => {
  // Implementação aqui
}
```

**Responsabilidades:**
- ✅ Usar `gemini-2.5-flash` (rápido)
- ✅ Fazer classificação binária (true/false)
- ✅ Retornar boolean puro
- ✅ Error handling (em caso de erro, retornar false)

**Prompt Internal:**
```
O usuário está aprovando/validando a seção do PRD que acabou de ser discutida? 
Mensagem do usuário: "${lastUserMessage}"

Retorne APENAS "true" se o usuário está aprovando (ex: "ótimo", "está bom", 
"próxima", "sim", "pode ir") ou "false" caso contrário.

Responda em JSON: { "isValidated": true } ou { "isValidated": false }
```

**Schema JSON:**
```typescript
const validationSchema = {
  type: Type.OBJECT,
  properties: {
    isValidated: { type: Type.BOOLEAN }
  },
  required: ['isValidated']
};
```

---

### 📋 ETAPA 3: Refatorar Estado do Chat
**Arquivo:** `components/Chat.tsx`  
**Tempo Estimado:** 20-25 minutos

#### Tarefa 3.1: Adicionar Estados Novos
```typescript
// Array de seções em ordem (do systemInstruction)
const SECTION_NAMES = [
  'visao_geral',
  'escopo',
  'personas',
  'requisitos_funcionais',
  'requisitos_nao_funcionais',
  'design_ux',
  'fluxo_usuario',
  'metricas_sucesso',
  'dependencias_riscos',
  'questoes_abertas'
];

// Novo estado para rastrear qual seção está sendo discutida
const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

// Novo estado para acumular dados de seções (já começa preenchido com valores vazios)
const [prdSectionData, setPrdSectionData] = useState<PrdSectionData>({
  visao_geral: '',
  escopo: '',
  personas: '',
  requisitos_funcionais: '',
  requisitos_nao_funcionais: '',
  design_ux: '',
  fluxo_usuario: '',
  metricas_sucesso: '',
  dependencias_riscos: '',
  questoes_abertas: ''
});

// Estado para rastrear quais seções já foram extraídas
const [extractedSections, setExtractedSections] = useState<Set<string>>(new Set());
```

#### Tarefa 3.2: Adicionar Função Auxiliar para Transição
```typescript
/**
 * Move para a próxima seção após validação da atual.
 */
const moveToNextSection = useCallback(() => {
  if (currentSectionIndex < SECTION_NAMES.length - 1) {
    const nextIndex = currentSectionIndex + 1;
    setCurrentSectionIndex(nextIndex);
    
    // Notificar usuário (mensagem automática do chat)
    const nextSectionName = SECTION_NAMES[nextIndex];
    setStatusMessage(`✅ Seção '${SECTION_NAMES[currentSectionIndex]}' extraída com sucesso!`);
    
    console.log(`📍 Movendo para seção ${nextIndex + 1}/10: ${nextSectionName}`);
  } else {
    console.log('🎉 Todas as seções foram preenchidas!');
    setStatusMessage('🎉 Todas as seções foram preenchidas! Clique em "Finalizar" para gerar o PRD.');
  }
}, [currentSectionIndex]);
```

---

### 📋 ETAPA 4: Refatorar Fluxo Principal do Chat
**Arquivo:** `components/Chat.tsx`  
**Tempo Estimado:** 30-40 minutos

#### Tarefa 4.1: Modificar `handleSendMessage` (ou função equivalente)
```typescript
/**
 * Fluxo proposto após enviar mensagem:
 * 
 * 1. Usuário envia mensagem → Adicionar à history
 * 2. Chat responde (streaming) → Atualizar UI
 * 3. [NOVO] Validar seção: isSectionValidatedByUser(lastUserMessage)?
 * 4. [NOVO] Se true → Extrair: extractSectionContent(history, currentSectionName)
 * 5. [NOVO] Se sucesso → Atualizar prdSectionData[seção] = conteúdo
 * 6. [NOVO] Transição: moveToNextSection()
 */

// Pseudocódigo do novo fluxo
const handleSendMessage = useCallback(async (userMessage: string) => {
  // ... código existente de envio ...

  // [NOVO] Após resposta recebida, validar seção
  console.log('🔍 Verificando se seção foi validada...');
  const isValidated = await isSectionValidatedByUser(userMessage);
  
  if (isValidated) {
    console.log(`✅ Seção '${SECTION_NAMES[currentSectionIndex]}' validada pelo usuário!`);
    
    // [NOVO] Extrair conteúdo da seção atual
    const currentSectionName = SECTION_NAMES[currentSectionIndex];
    const extractedContent = await extractSectionContent(
      messages as any[], // Histórico de conversa
      currentSectionName
    );
    
    if (extractedContent) {
      // [NOVO] Atualizar prdSectionData
      setPrdSectionData(prev => ({
        ...prev,
        [currentSectionName]: extractedContent
      }));
      
      // [NOVO] Registrar extração
      setExtractedSections(prev => new Set([...prev, currentSectionName]));
      
      console.log(`📊 prdSectionData atualizado:`, prdSectionData);
      
      // [NOVO] Transição para próxima seção
      moveToNextSection();
    } else {
      console.error(`❌ Falha ao extrair conteúdo de '${currentSectionName}'`);
      setStatusMessage(`❌ Erro ao extrair seção '${currentSectionName}'. Tente novamente.`);
    }
  } else {
    console.log('⏳ Usuário ainda está preenchendo a seção...');
  }
}, [currentSectionIndex, messages, moveToNextSection]);
```

---

### 📋 ETAPA 5: Simplificar Geração Final
**Arquivo:** `components/Chat.tsx` (função do botão "Finalizar")  
**Tempo Estimado:** 15-20 minutos

#### Tarefa 5.1: Remover Lógica Antiga de Sumarização
```typescript
// ❌ REMOVER: Lógica que enviava histórico completo
// const response = await geminiService.summarizeConversation(messages);
```

#### Tarefa 5.2: Nova Lógica de Geração (Usa prdSectionData)
```typescript
/**
 * Novo fluxo simplificado:
 * 1. Verificar se todas as 10 seções foram preenchidas
 * 2. Combinar prdSectionData com dados do formulário
 * 3. Chamar generateProductDocuments (que já espera prdSectionData)
 * 4. Retornar PRD + Tarefas para OutputView
 */

const handleFinalizeAndGenerate = useCallback(async () => {
  console.log('🚀 Iniciando geração final de documentos...');
  
  // Verificar completude
  const allSectionsFilled = Object.values(prdSectionData).every(
    section => section && section.trim().length > 0
  );
  
  if (!allSectionsFilled) {
    const missingCount = Object.entries(prdSectionData)
      .filter(([_, content]) => !content || !content.trim())
      .length;
    
    setStatusMessage(`⚠️ ${missingCount} seção(ões) ainda não foram extraída(s).`);
    return;
  }
  
  try {
    setIsLoading(true);
    
    // Preparar dados para geração (incluindo prdSectionData já preenchido)
    const generateInput = {
      product_name: productName,
      main_objective: mainObjective,
      team: team,
      tech_stack: techStack, // Adicionar se disponível
      prd_sections: prdSectionData
    };
    
    console.log('📋 Dados para geração final:', generateInput);
    
    // Chamar função de geração (sem mudanças)
    const result = await generateProductDocuments(generateInput);
    
    // Callback para atualizar UI
    onPrdGenerationComplete(result);
    
    setStatusMessage('✅ PRD e tarefas geradas com sucesso!');
    console.log('✅ Documentos finais:', result);
    
  } catch (error) {
    console.error('❌ Erro na geração final:', error);
    setStatusMessage('❌ Erro ao gerar documentos finais. Tente novamente.');
  } finally {
    setIsLoading(false);
  }
}, [prdSectionData, productName, mainObjective, team, onPrdGenerationComplete]);
```

---

### 📋 ETAPA 6: Integração e Logging
**Arquivo:** `components/Chat.tsx` + `services/geminiService.ts`  
**Tempo Estimado:** 10 minutos

#### Tarefa 6.1: Adicionar Logging de Debug
Adicionar console.log em pontos críticos:

```typescript
// No extractSectionContent (geminiService)
console.log(`📤 Extraindo seção: ${sectionName}`);
console.log(`📥 Resposta recebida:`, sectionContent);

// No isSectionValidatedByUser (geminiService)
console.log(`🔍 Analisando validação: "${lastUserMessage}"`);
console.log(`✅/❌ Resultado:`, isValidated);

// No Chat.tsx
console.log(`📊 prdSectionData estado atual:`, prdSectionData);
console.log(`🎯 Seções extraídas:`, Array.from(extractedSections));
```

---

## 3. DIAGRAMA DO NOVO FLUXO

```
┌─────────────────────────────────────────────────────────────────┐
│  USUÁRIO PREENCHE FORMULÁRIO (Etapas 1-2)                      │
│  productName, mainObjective, team, techStack                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  CHAT INTERATIVO (Etapa 3)                                      │
│  - currentSectionIndex = 0 (visao_geral)                        │
│  - prdSectionData = {todas vazias}                              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │ LOOP PARA CADA SEÇÃO      │
        │ (10 iterações)            │
        └─────────────┬─────────────┘
                      │
        ┌─────────────┴─────────────────────────────────────────┐
        │  CONVERSA SOBRE SEÇÃO N                              │
        │  - Usuário envia mensagens                            │
        │  - Chat responde (streaming)                          │
        └─────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────────────────────────────────┐
        │  [NOVO] VALIDAÇÃO INCREMENTAL                         │
        │  - isSectionValidatedByUser(lastUserMessage)?         │
        │  - Se FALSE → Continuar conversa (loop)               │
        │  - Se TRUE → Ir para próximo passo                    │
        └──────────────┬────────────────────────────────────────┘
                       │ (TRUE)
        ┌──────────────┴────────────────────────────────────────┐
        │  [NOVO] EXTRAÇÃO INCREMENTAL                         │
        │  - extractSectionContent(history, sectionName)       │
        │  - Gemini processa APENAS 1 seção                    │
        │  - Retorna: { sectionContent: "..." }                │
        └──────────────┬────────────────────────────────────────┘
                       │
        ┌──────────────┴────────────────────────────────────────┐
        │  [NOVO] ATUALIZAÇÃO DE ESTADO                        │
        │  - prdSectionData[sectionName] = conteúdo           │
        │  - extractedSections.add(sectionName)                │
        │  - Logar estado atualizado                           │
        └──────────────┬────────────────────────────────────────┘
                       │
        ┌──────────────┴────────────────────────────────────────┐
        │  [NOVO] TRANSIÇÃO                                    │
        │  - moveToNextSection()                               │
        │  - currentSectionIndex++                             │
        │  - Notificar usuário                                 │
        └──────────────┬────────────────────────────────────────┘
                       │
                  ┌────┴─────┐
                  │ Mais seções?
                  ├─ SIM → Voltar ao início do loop
                  └─ NÃO → Ir para próximo passo
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  BOTÃO "FINALIZAR E GERAR PRD"                                  │
│  - Verificar prdSectionData (todas 10 seções preenchidas?)     │
│  - Preparar input: { product_name, tech_stack, prd_sections }  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  GERAÇÃO FINAL (Simplificado)                                   │
│  - generateProductDocuments(input)                              │
│  - Gemini recebe dados já processados (sem token bloat)        │
│  - Retorna: { prd_markdown, tasks_json }                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL (OutputView)                                   │
│  - PRD em Markdown                                              │
│  - Lista de Tarefas                                             │
│  - Opções de Exportar                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. RESUMO DAS MUDANÇAS

| Componente | Mudança | Impacto |
|-----------|---------|---------|
| **geminiService.ts** | ➕ `extractSectionContent(history, sectionName)` | Extração incremental |
| **geminiService.ts** | ➕ `isSectionValidatedByUser(message)` | Detecção automática |
| **Chat.tsx** | ➕ `currentSectionIndex` state | Rastreamento de seção |
| **Chat.tsx** | ➕ `prdSectionData` state | Acúmulo incremental |
| **Chat.tsx** | ➕ `extractedSections` set | Tracking de progresso |
| **Chat.tsx** | ➕ `moveToNextSection()` function | Transição automática |
| **Chat.tsx** | 🔄 `handleSendMessage()` | Adicionar validação + extração |
| **Chat.tsx** | 🔄 `handleFinalizeAndGenerate()` | Remover sumarização massiva |
| **geminiService.ts** | ❌ Remover lógica antiga | Simplificar geração final |

---

## 5. BENEFÍCIOS DA SOLUÇÃO

✅ **Resolve Token Limit:** Cada extração processa ~1 seção (pequeno payload)  
✅ **Mais Rápido:** Gemini não precisa reavaliar contexto 10 vezes  
✅ **UX Melhorado:** Feedback visual a cada seção (✅ extraída com sucesso)  
✅ **Debug Facilitado:** Logs detalhados mostram exatamente onde está cada seção  
✅ **Escalável:** Fácil adicionar mais seções sem preocupação com token limit  
✅ **Resiliente:** Se uma seção falha, é fácil reprocessar  

---

## 6. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Mitigação |
|-------|--------------|----------|
| Gemini classifica false positives (validação incorreta) | Média | Testar prompts de classificação; usar gemini-2.5-flash (mais rápido) |
| Extração perde contexto (sem histórico completo) | Baixa | Enviar últimas N mensagens, não apenas a atual |
| Performance (muitas chamadas API) | Baixa | 10 chamadas de extração = menos que 1 chamada massiva |
| Estado prdSectionData fica inconsistente | Baixa | Logging detalhado + testes de ponta a ponta |

---

## 7. CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Você aprova o diagrama do fluxo proposto?
- [ ] Os nomes das funções (`extractSectionContent`, `isSectionValidatedByUser`, `moveToNextSection`) estão OK?
- [ ] As responsabilidades de cada etapa estão claras?
- [ ] Você quer ajustes no prompt de validação ou extração?
- [ ] Há conflitos com a arquitetura atual que possamos discutir?
- [ ] Queremos implementar tudo de uma vez ou em fases?

---

## 8. ESTIMATIVA DE TEMPO TOTAL

| Etapa | Tempo | Subtotal |
|-------|-------|----------|
| 1. Novo Serviço | 15-20 min | **35-40 min** |
| 2. Validador | 10-15 min | |
| 3. Refatorar Estado | 20-25 min | **50-60 min** |
| 4. Refatorar Fluxo | 30-40 min | |
| 5. Simplificar Geração | 15-20 min | **15-20 min** |
| 6. Logging | 10 min | |
| **TOTAL** | | **100-120 minutos** (~2 horas) |

---

## ✅ PRÓXIMO PASSO

Após sua aprovação, vou proceder com:

1. **Implementar `extractSectionContent`** em geminiService.ts
2. **Implementar `isSectionValidatedByUser`** em geminiService.ts
3. **Refatorar Chat.tsx** com novos estados e funções
4. **Testar de ponta a ponta** com conversa de 10 seções
5. **Validar** que não excedem token limit

👉 **Você aprova o plano? Quer algum ajuste antes de começarmos?**
