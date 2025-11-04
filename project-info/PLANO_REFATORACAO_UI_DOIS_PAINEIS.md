# 🎨 PLANO DE EXECUÇÃO: REFATORAÇÃO UI - DOIS PAINÉIS

**Data:** 3 de Novembro de 2025  
**Prioridade:** 🔴 CRÍTICA  
**Status:** ⏳ Aguardando Aprovação  
**Impacto:** Melhora exponencial da UX + integração de extração incremental

---

## 1. ANÁLISE DO PROBLEMA

### Problema Identificado
```
❌ ESTADO ATUAL:
Chat único e linear → Usuário perde contexto → PRD fica "invisível" durante discussão
→ Difícil validar progresso → Ineficiente para desenvolvimento

🟢 ESTADO DESEJADO:
Chat esquerda ← → Painel PRD direita (tempo real)
Usuário vê progresso enquanto conversa → Contexto sempre visível
Sincronização automática → "Ótimo, próxima" → Extrai + Atualiza painel
```

### Causa Raiz
- PRD é construído apenas no final (estado prdSectionData invisível durante chat)
- Usuário não sabe se conteúdo foi capturado corretamente
- Sem feedback visual do progresso real

### Solução
- **Painel em tempo real:** PRD atualiza a cada seção validada
- **Layout responsivo:** Chat + Resumo lado a lado
- **Sincronização automática:** Extração → Atualização visual instantânea

---

## 2. ARQUITETURA DA SOLUÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│  App.tsx (Pai - Orquestra tudo)                                │
│  ├─ prdSectionData (state)                                      │
│  ├─ currentSectionIndex (state)                                 │
│  ├─ extractedSections (state)                                   │
│  └─ Passa para ambos os filhos                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│  Chat.tsx (Esquerda)      │  │ PrdSummaryPanel (Direita)    │
│  33% largura              │  │ 66% largura                  │
├───────────────────────────┤  ├──────────────────────────────┤
│ - sendMessage()           │  │ - Map prdSectionData        │
│ - isSectionValidated()    │  │ - Render Cards por seção    │
│ - extractSection()        │  │ - Placeholder se vazio      │
│ - moveToNextSection()     │  │ - Atualiza em tempo real    │
│                           │  │                              │
│ Fluxo:                    │  │ Props:                       │
│ 1. Usuário digita        │  │ - prdData: PrdSectionData   │
│ 2. Chat responde         │  │ - currentIndex: number      │
│ 3. Valida + Extrai       │  │ - extractedCount: number    │
│ 4. setPrdSectionData()   │──→ (Triggera re-render)        │
│ 5. moveToNextSection()   │  │                              │
└───────────────────────────┘  └──────────────────────────────┘
```

---

## 3. PLANO DETALHADO EM ETAPAS

### 📋 ETAPA 1: Criar Componente PrdSummaryPanel
**Arquivo:** `components/PrdSummaryPanel.tsx` (novo)  
**Tempo Estimado:** 15-20 minutos

#### Tarefa 1.1: Estrutura do Componente
```typescript
interface PrdSummaryPanelProps {
  prdData: PrdSectionData;
  currentSectionIndex: number;
  extractedCount: number;
}

const PrdSummaryPanel: React.FC<PrdSummaryPanelProps> = ({
  prdData,
  currentSectionIndex,
  extractedCount
}) => {
  // Implementação aqui
}
```

**Responsabilidades:**
- ✅ Receber `prdData` como prop (atualiza quando pai muda)
- ✅ Mapear 10 seções do PRD
- ✅ Renderizar Card para cada seção
- ✅ Mostrar placeholder se vazio
- ✅ Mostrar conteúdo se preenchido
- ✅ Indicador visual de progresso (✅/🚧)
- ✅ Scrollable (overflow auto)

#### Tarefa 1.2: Mapa de Seções
```typescript
const SECTION_DISPLAY = {
  visao_geral: { title: 'Visão Geral', icon: '👁️' },
  escopo: { title: 'Escopo', icon: '📋' },
  personas: { title: 'Personas', icon: '👥' },
  requisitos_funcionais: { title: 'Requisitos Funcionais', icon: '⚙️' },
  requisitos_nao_funcionais: { title: 'Requisitos Não Funcionais', icon: '🔧' },
  design_ux: { title: 'Design & UX', icon: '🎨' },
  fluxo_usuario: { title: 'Fluxo de Usuário', icon: '🔄' },
  metricas_sucesso: { title: 'Métricas de Sucesso', icon: '📊' },
  dependencias_riscos: { title: 'Dependências & Riscos', icon: '⚠️' },
  questoes_abertas: { title: 'Questões em Aberto', icon: '❓' }
}
```

#### Tarefa 1.3: Renderização de Card
```typescript
{Object.entries(prdData).map(([key, content]) => {
  const isExtracted = content && content.trim().length > 0;
  const sectionInfo = SECTION_DISPLAY[key as keyof PrdSectionData];
  
  return (
    <Card key={key} className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">
            {sectionInfo.icon} {sectionInfo.title}
          </span>
          {isExtracted ? (
            <span className="text-green-400">✅ Extraída</span>
          ) : (
            <span className="text-yellow-400">🚧 Aguardando</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isExtracted ? (
          <p className="text-sm text-gray-300 line-clamp-4">{content}</p>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Aguardando informações do chat...
          </p>
        )}
      </CardContent>
    </Card>
  );
})}
```

#### Tarefa 1.4: Progress Bar
```typescript
<div className="mb-6 p-4 bg-gray-800 rounded-lg">
  <div className="flex justify-between mb-2">
    <span className="text-sm font-semibold">Progresso: {extractedCount}/10</span>
    <span className="text-sm text-gray-400">
      {Math.round((extractedCount / 10) * 100)}%
    </span>
  </div>
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
      style={{ width: `${(extractedCount / 10) * 100}%` }}
    />
  </div>
</div>
```

---

### 📋 ETAPA 2: Refatorar Layout Principal
**Arquivo:** `App.tsx` ou novo `components/ChatLayout.tsx`  
**Tempo Estimado:** 20-25 minutos

#### Tarefa 2.1: Nova Estrutura de Layout
```typescript
// Em App.tsx ou ChatLayout.tsx
return (
  <div className="flex h-screen gap-4 p-4 bg-gray-900">
    {/* Coluna Esquerda: Chat (33%) */}
    <div className="w-1/3 flex flex-col bg-gray-800 rounded-lg p-4 overflow-hidden">
      <Chat
        onPrdGenerationComplete={handlePrdGeneration}
        productName={productName}
        mainObjective={mainObjective}
        team={team}
        prdSectionData={prdSectionData}
        setPrdSectionData={setPrdSectionData}
        currentSectionIndex={currentSectionIndex}
        setCurrentSectionIndex={setCurrentSectionIndex}
        extractedSections={extractedSections}
        setExtractedSections={setExtractedSections}
      />
    </div>

    {/* Coluna Direita: PRD Summary (66%) */}
    <div className="w-2/3 flex flex-col bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-xl font-bold mb-4 text-blue-400">
        📄 Resumo do PRD (Tempo Real)
      </h2>
      <div className="overflow-y-auto flex-1">
        <PrdSummaryPanel
          prdData={prdSectionData}
          currentSectionIndex={currentSectionIndex}
          extractedCount={extractedSections.size}
        />
      </div>
    </div>
  </div>
);
```

#### Tarefa 2.2: CSS/Tailwind
- ✅ Usar `flex` para layout lado a lado
- ✅ `w-1/3` para chat (esquerda)
- ✅ `w-2/3` para resumo (direita)
- ✅ `overflow-y-auto` para scroll
- ✅ Gap entre painéis
- ✅ Background colors consistentes

#### Tarefa 2.3: Responsividade (Opcional, Fase 3)
```typescript
// Quebra em tela pequena
<div className="flex flex-col lg:flex-row h-screen gap-4">
  <div className="w-full lg:w-1/3">...</div>
  <div className="w-full lg:w-2/3">...</div>
</div>
```

---

### 📋 ETAPA 3: Refatorar Chat.tsx com Lógica Incremental
**Arquivo:** `components/Chat.tsx`  
**Tempo Estimado:** 30-40 minutos

#### Tarefa 3.1: Novos Props
```typescript
interface ChatProps {
  onPrdGenerationComplete: (sections: PrdSectionData) => void;
  productName: string;
  mainObjective: string;
  team: string;
  // [NOVOS]
  prdSectionData: PrdSectionData;
  setPrdSectionData: (data: PrdSectionData) => void;
  currentSectionIndex: number;
  setCurrentSectionIndex: (index: number) => void;
  extractedSections: Set<string>;
  setExtractedSections: (sections: Set<string>) => void;
}
```

#### Tarefa 3.2: Estados Simplificados
```typescript
// Remover do Chat.tsx (passar como props):
// - prdSectionData
// - currentSectionIndex
// - extractedSections

// Manter no Chat.tsx:
// - messages
// - userInput
// - isLoading
// - statusMessage
// - isChatReady
```

#### Tarefa 3.3: Fluxo de sendMessage Completo
```typescript
const sendMessage = async (message: string) => {
  // 1. Enviar mensagem (existente)
  const userMessage = { id: `user-${Date.now()}`, role: 'user', content: message };
  
  // 2. Receber resposta (streaming existente)
  const response = await chatRef.current.sendMessageStream({ message });
  // ... acumular resposta
  
  // 3. [NOVO] Validar seção
  console.log('🔍 Verificando se seção foi validada...');
  const isValidated = await isSectionValidatedByUser(message);
  
  if (isValidated) {
    // 4. [NOVO] Extrair conteúdo
    const currentSectionName = SECTION_NAMES[currentSectionIndex];
    console.log(`✅ Seção '${currentSectionName}' validada!`);
    
    const extractedContent = await extractSectionContent(
      messages,
      currentSectionName
    );
    
    if (extractedContent) {
      // 5. [CRÍTICO] Atualizar prdSectionData
      setPrdSectionData(prev => ({
        ...prev,
        [currentSectionName]: extractedContent
      }));
      
      // 6. [CRÍTICO] Registrar extração
      setExtractedSections(new Set([...extractedSections, currentSectionName]));
      
      // 7. [NOVO] Transição para próxima seção
      moveToNextSection();
    }
  }
};
```

#### Tarefa 3.4: Função moveToNextSection
```typescript
const moveToNextSection = useCallback(() => {
  if (currentSectionIndex < SECTION_NAMES.length - 1) {
    const nextIndex = currentSectionIndex + 1;
    setCurrentSectionIndex(nextIndex);
    
    setStatusMessage(`✅ Próxima seção: ${SECTION_NAMES[nextIndex]}`);
    console.log(`📍 Movendo para seção ${nextIndex + 1}/10`);
  } else {
    setStatusMessage('🎉 Todas as seções preenchidas!');
  }
}, [currentSectionIndex]);
```

---

### 📋 ETAPA 4: Integração e Sincronização
**Arquivo:** `App.tsx`  
**Tempo Estimado:** 15-20 minutos

#### Tarefa 4.1: Estados Pai (App.tsx)
```typescript
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

const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
const [extractedSections, setExtractedSections] = useState<Set<string>>(new Set());
```

#### Tarefa 4.2: Fluxo de Dados (Diagrama)
```
Usuário digita "Ótimo"
    ↓
Chat.sendMessage()
    ↓
isSectionValidatedByUser() → true
    ↓
extractSectionContent() → "conteúdo da seção"
    ↓
setPrdSectionData(prev => {..., visao_geral: "conteúdo"})
    ↓
setExtractedSections(new Set([...prev, 'visao_geral']))
    ↓
App.tsx re-renderiza com novo estado
    ↓
PrdSummaryPanel recebe novo prdData
    ↓
Card '👁️ Visão Geral' muda de 🚧 para ✅
    ↓
Progressbar: 0/10 → 1/10 (10%)
```

#### Tarefa 4.3: Observar Atualizações em Tempo Real
```typescript
// Adicionar useEffect para debug (remover depois)
useEffect(() => {
  console.log('📊 PRD Sections Updated:', prdSectionData);
  console.log('🎯 Extracted Count:', extractedSections.size);
}, [prdSectionData, extractedSections]);
```

---

## 4. DIAGRAMA DO FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 1: Chat Esquerda                                        │
│  Usuário: "O TaskFlow é um app de gerenciar projetos"         │
│  Bot: [Responde e valida]                                     │
│  Usuario: "Perfeito, próxima seção"                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 2: Validação (Chat.tsx)                                 │
│  isSectionValidatedByUser("Perfeito, próxima") → true         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 3: Extração (geminiService)                            │
│  extractSectionContent(history, 'visao_geral') → "conteúdo"   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 4: Atualização de Estado (App.tsx)                     │
│  setPrdSectionData({...prev, visao_geral: "conteúdo"})       │
│  setExtractedSections(new Set([...prev, 'visao_geral']))     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 5: Painel Direita (PrdSummaryPanel)                    │
│  Re-renderiza com novo prdData                                │
│  Card 'Visão Geral': 🚧 → ✅                                  │
│  Progressbar: 0/10 → 1/10 (10%)                              │
│  User vê progresso em TEMPO REAL ✨                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. COMPONENTES E MODIFICAÇÕES

| Arquivo | Tipo | Ação |
|---------|------|------|
| `components/PrdSummaryPanel.tsx` | ➕ Novo | Criar componente de resumo |
| `components/Chat.tsx` | 🔄 Refatorar | Adicionar props, refatorar sendMessage |
| `App.tsx` | 🔄 Refatorar | Adicionar layout 2 colunas + estados pai |
| `services/geminiService.ts` | ✅ Existente | Usar funções já implementadas |
| `types.ts` | ✅ Existente | Tipos já definidos |

---

## 6. ESTADO VISUAL ESPERADO

### Tela Após 3 Seções Validadas

```
┌──────────────────────────────────────────────────────────────────┐
│                     ProductBuddy AI                              │
├─────────────────────────┬──────────────────────────────────────┤
│  Chat (33%)            │  📄 Resumo do PRD (66%)              │
├─────────────────────────┼──────────────────────────────────────┤
│                         │                                      │
│ ProductBuddy: Vamos     │  Progresso: 3/10 (30%)              │
│ discutir o Fluxo de     │  ░░░░▓▓▓░░░░░░░░░░░░               │
│ Usuário?                │                                      │
│                         │  👁️  Visão Geral         ✅          │
│ Você: Certo. O fluxo   │  📄 App para gerenciar...            │
│ começa com login,      │                                      │
│ depois dashboard...    │  📋 Escopo               ✅          │
│                         │  📄 Dashboard, tarefas,              │
│ ProductBuddy: Perfeito! │     equipes...                       │
│ Próxima?               │                                      │
│                         │  👥 Personas            ✅          │
│ [Input: Próxima]       │  📄 Project Managers,               │
│                         │     Devs, Stakeholders              │
│                         │                                      │
│                         │  ⚙️  Req. Funcionais     🚧          │
│                         │  🚧 Aguardando...                    │
│                         │                                      │
│                         │  ... (6 mais seções)                │
│                         │                                      │
└─────────────────────────┴──────────────────────────────────────┘
```

---

## 7. BENEFÍCIOS

✅ **UX Exponencialmente Melhor**
- Usuário vê PRD sendo construído em tempo real
- Contexto sempre visível
- Feedback visual claro

✅ **Desenvolvimento Mais Eficiente**
- Fácil validar se seção foi capturada corretamente
- Não precisa scrollar para ver progresso
- Dashboard visual do PRD

✅ **Integração Perfeita com Bug Fix**
- Extração incremental + Visualização incremental
- Sincronização automática
- Sem overhead

✅ **Escalável**
- Fácil adicionar mais info no painel
- Layout responsivo preparado
- Componente reutilizável

---

## 8. CHECKLIST PRÉ-IMPLEMENTAÇÃO

- [ ] Estrutura de 2 colunas (33% / 66%) está clara?
- [ ] Componente PrdSummaryPanel com Cards está OK?
- [ ] Fluxo de sincronização (setPrdSectionData → re-render) entendido?
- [ ] Props que Chat.tsx vai receber estão OK?
- [ ] Integração com geminiService existente aprovada?
- [ ] Visual do painel de resumo agrada?
- [ ] Quer adicionar mais features (ex: export, collapse)?
- [ ] Quer primeiro testar com 1-2 seções antes de todas as 10?

---

## 9. ESTIMATIVA DE TEMPO

| Etapa | Tempo | Subtotal |
|-------|-------|----------|
| 1. PrdSummaryPanel | 15-20 min | **15-20 min** |
| 2. Refatorar Layout | 20-25 min | **40-50 min** |
| 3. Refatorar Chat.tsx | 30-40 min | **70-90 min** |
| 4. Integração | 15-20 min | **85-110 min** |
| **TOTAL** | | **~90-110 minutos (1.5-2 horas)** |

---

## ✅ PRÓXIMO PASSO

Após sua aprovação, vou proceder com:

1. **Criar PrdSummaryPanel.tsx** com cards, progress bar, ícones
2. **Refatorar App.tsx** para layout 2 colunas + estados
3. **Refatorar Chat.tsx** com novos props e lógica completa
4. **Testar fluxo completo** de sincronização em tempo real
5. **Validar** que tudo funciona sem erros

👉 **Você aprova o plano? Quer algum ajuste antes de começarmos?**
