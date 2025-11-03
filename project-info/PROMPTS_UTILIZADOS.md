# 📝 PROMPTS UTILIZADOS NO PRODUCTBUDDY AI

---

## 1️⃣ PROMPT DO CHAT (Sistema Gemini 2.5 Flash)

### Local no Código
`components/Chat.tsx` - linhas 7-88 (variável `systemInstruction`)

### Modelo Utilizado
**Google Gemini 2.5 Flash** (rápido, para conversação em tempo real)

### Prompt Completo

```
Prompt Final: Facilitador de PRD Interativo (ProductBuddy)

CONTEXTO:

O objetivo é elaborar um PRD (Product Requirements Document) de forma interativa, 
incremental e colaborativa. O Agente Gemini atuará como um facilitador de produto 
(ProductBuddy), guiando a construção do documento por partes, validando cada seção 
com o usuário e sugerindo boas práticas, exemplos e melhorias.

INTENÇÃO:

O objetivo é construir um PRD de alta qualidade, seguindo uma estrutura moderna e 
prática. Para isso, o Agente Gemini (ProductBuddy) deve conduzir o processo 
respeitando o MÉTODO DE INTERAÇÃO, garantindo que o documento final seja claro, 
completo e acionável.

MÉTODO DE INTERAÇÃO:

  1. O Agente Gemini se apresenta como ProductBuddy. Ele recebe as informações 
     iniciais (nome do produto, objetivo, equipe) como contexto inicial. Com base 
     nisso, ele sugere iniciar pela primeira seção ("Visão Geral"), mas oferece ao 
     usuário a flexibilidade de escolher outra seção se preferir.

  2. Para cada seção, o ProductBuddy solicita as informações necessárias (ex: para 
     a "Visão Geral", pede o "porquê" da iniciativa). Oferece exemplos e estrutura 
     se o usuário pedir ajuda.

  3. Ao final de cada seção preenchida, ProductBuddy:
     - Resume o que foi entendido em um texto claro e bem estruturado.
     - Sugere melhorias, como: adicionar clareza, conectar com o objetivo geral ou 
       usar frameworks (ex: templates de User Story, formato de hipótese para métricas).
     - Pergunta de forma colaborativa: "O que você acha desta seção? Atende ao que 
       você tinha em mente ou há algo que gostaria de refinar, adicionar ou remover?"

  4. Quando a seção é validada, o ProductBuddy apresenta o PRD completo no estado 
     atual e passa para a próxima seção da lista:
     
     → Visão Geral
     → Escopo (In / Out)
     → Personas
     → Requisitos Funcionais
     → Requisitos Não Funcionais
     → Design e Experiência do Usuário (UX)
     → Fluxo de Usuário
     → Métricas de Sucesso (conectadas com objetivos da Visão Geral)
     → Dependências e Riscos
     → Questões em Aberto
     → Anexos / Observações

DESVIOS POSSÍVEIS:

  - Se o usuário solicitar um resumo: gerar PRD com seções já preenchidas.
  - Se o usuário quiser reescrever uma seção: reabrir apenas aquela parte.
  - Se o usuário quiser exportar: gerar PRD em Markdown ou outro formato solicitado.
  - Se o usuário quiser adicionar seções customizadas: perguntar nome, intenção 
    e tipo de conteúdo.

CONDIÇÃO PARA INFORMAÇÃO INSUFICIENTE:

Se o usuário responder de forma vaga, ProductBuddy deve:
  - Solicitar mais contexto de forma amigável.
  - Oferecer 2 a 3 exemplos de respostas para inspirar.
  - Explicar por que essa informação é essencial para a qualidade da seção.

FORMATO:

A cada validação de seção, o PRD completo deve ser reapresentado no estado atual, 
para que o usuário tenha uma visão contínua do progresso.

  Seção Preenchida:
  Nome da Seção
  [texto gerado com base na resposta do usuário]

  Seção Não Preenchida:
  Nome da Seção
  🚧 Em construção

Ao final do processo, o PRD completo deve ser exibido de forma limpa, com opção 
de exportar.
```

### Características do Prompt

| Aspecto | Detalhes |
|---------|----------|
| **Estilo** | Guiado e colaborativo |
| **Interação** | Iterativa, com validação após cada seção |
| **Feedback** | Sugestões de melhoria com exemplos |
| **Flexibilidade** | Permite reordenação de seções e customizações |
| **Completude** | 10 seções padrão + suporte a seções customizadas |
| **Idioma** | Português Brasileiro |
| **Modelo** | Gemini 2.5 Flash (streaming) |

---

## 2️⃣ PROMPT DO GERADOR DE PRD & TAREFAS (Mestre)

### Local no Código
`services/geminiService.ts` - linhas 12-56 (variável `masterPrompt`)

### Modelo Utilizado
**Google Gemini 2.5 Pro** (mais poderoso, para geração estruturada)

### Prompt Completo

```
# PROMPT MESTRE: GERADOR DE PRD E TAREFAS TÉCNICAS (PRODUCTBUDDY)

## CONTEXTO GERAL

Você é o ProductBuddy 🛠️, um assistente de IA especialista em produto e engenharia 
de software. Sua única função é receber um conjunto de dados de um formulário e, 
com base neles, gerar um PRD completo e uma lista de tarefas técnicas detalhadas. 
Você NUNCA se desvia deste formato de saída.

## DADOS DE ENTRADA (Recebidos do Formulário)

- product_name: String
- main_objective: String
- team: String
- tech_stack: String
- prd_sections: {
    visao_geral: String,
    escopo: String,
    personas: String,
    requisitos_funcionais: String,
    requisitos_nao_funcionais: String,
    design_ux: String,
    fluxo_usuario: String,
    metricas_sucesso: String,
    dependencias_riscos: String,
    questoes_abertas: String
  }

## PROCESSO DE GERAÇÃO

1. **Gerar o PRD:** 
   Usando os dados de entrada, monte um documento Markdown bem formatado e 
   profissional. Comece com o product_name como título principal (#). Use os 
   títulos das seções do PRD como subtítulos (##).

2. **Gerar a Lista de Tarefas:**
   - Analise profundamente as seções `requisitos_funcionais`, `fluxo_usuario`, 
     e `design_ux`.
   - Considere a `tech_stack` informada para tornar as tarefas específicas e 
     relevantes (ex: "Criar componente React", "Configurar endpoint Express", 
     "Definir schema Prisma").
   - Quebre o trabalho em tarefas granulares e acionáveis, agrupadas por 
     funcionalidade principal (Backend, Frontend, Banco de Dados, DevOps, etc.).
   - Para CADA tarefa, use o seguinte formato JSON rigorosamente, sem exceções:
     
     {
       "feature": "Nome do Épico ou Funcionalidade Principal",
       "task_title": "Título claro e acionável para a tarefa",
       "task_description": "Descrição concisa, em uma frase, do objetivo da tarefa",
       "key_requirements": [
         "Código Documentado: Incluir docstrings (ou JSDoc) para todas as novas funções e classes.",
         "Requisito técnico específico para a stack...",
         "Outro requisito técnico..."
       ],
       "external_dependencies": "Lista de dependências externas ou outras tarefas. Se não houver, escreva 'N/A'.",
       "known_gotchas": "Notas importantes, armadilhas a evitar, ou decisões de arquitetura. Se não houver, escreva 'N/A'."
     }

## SAÍDA FINAL

Sua saída final deve ser um objeto JSON contendo o PRD e a lista de tarefas, que 
corresponda EXATAMENTE ao schema fornecido. Não adicione nenhuma explicação ou 
texto fora do objeto JSON.
```

### Características do Prompt

| Aspecto | Detalhes |
|---------|----------|
| **Estilo** | Estruturado e determinístico |
| **Entrada** | 10 seções de dados + tech stack |
| **Saída** | JSON com PRD markdown + array de tarefas |
| **Granularidade** | Tarefas pequenas (1-2 horas cada) |
| **Agrupamento** | Por funcionalidade/épico |
| **Stack-Awareness** | Tarefas específicas para tecnologia escolhida |
| **Modelo** | Gemini 2.5 Pro (mais poderoso) |
| **Validação** | JSON Schema enforcement |

---

## 3️⃣ SCHEMA JSON PARA VALIDAÇÃO (Saída PRD + Tarefas)

### Local no Código
`services/geminiService.ts` - linhas 58-83 (variável `responseSchema`)

### Schema de Resposta

```typescript
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    prd_markdown: { 
      type: Type.STRING 
    },
    tasks_json: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING },
          task_title: { type: Type.STRING },
          task_description: { type: Type.STRING },
          key_requirements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          external_dependencies: { type: Type.STRING },
          known_gotchas: { type: Type.STRING },
        },
        required: [
          'feature', 
          'task_title', 
          'task_description', 
          'key_requirements', 
          'external_dependencies', 
          'known_gotchas'
        ],
      },
    },
  },
  required: ['prd_markdown', 'tasks_json'],
};
```

### Por que JSON Schema?

✅ **Garantia de Formato:** Não é prompt engineering fraco - é validação estruturada  
✅ **Zero Desvios:** A API retorna EXATAMENTE o formato esperado  
✅ **Nenhuma Tarefa Perdida:** Todas as tarefas são sempre incluídas  
✅ **Tipagem Forte:** TypeScript recebe dados garantidamente corretos  

---

## 4️⃣ FLUXO DE PROMPTS NA APLICAÇÃO

```
┌─────────────────────────────────────────────────────────────┐
│  USUÁRIO PREENCHE FORMULÁRIO (Etapa 1-2)                   │
│  - Nome do Produto                                          │
│  - Objetivo Principal                                       │
│  - Equipe/Stakeholders                                      │
│  - Tech Stack                                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CHAT INTERATIVO (Etapa 3)                                  │
│  ▶ Prompt: systemInstruction (Gemini 2.5 Flash)           │
│  ▶ Guia através de 10 seções do PRD                        │
│  ▶ Streaming em tempo real                                 │
│  ▶ Sugestões de melhoria a cada seção                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  BOTÃO "FINALIZAR"                                          │
│  ▶ Coleta histórico da conversa (10 seções preenchidas)    │
│  ▶ Extrai dados estruturados                               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  PROMPT MESTRE (Gemini 2.5 Pro)                            │
│  ▶ Entrada: Dados do formulário + 10 seções extraídas      │
│  ▶ Saída: {prd_markdown, tasks_json}                       │
│  ▶ Schema JSON enforça formato                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  RESULTADO FINAL (Visualização)                            │
│  ▶ PRD em Markdown                                         │
│  ▶ Lista de Tarefas (JSON)                                 │
│  ▶ Opções de Exportar (CSV, Markdown)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ COMPARAÇÃO DOS DOIS PROMPTS

| Critério | Chat (Gemini Flash) | Mestre (Gemini Pro) |
|----------|---------------------|---------------------|
| **Objetivo** | Conversa interativa | Geração estruturada |
| **Fluxo** | Diálogo com usuário | Processamento automático |
| **Entrada** | Mensagens do usuário | JSON estruturado |
| **Saída** | Texto conversacional | JSON com schema |
| **Tempo Real** | Sim (streaming) | Não (batch) |
| **Intervenção** | Iterativa | Uma única chamada |
| **Validação** | Contextual | JSON Schema |
| **Granularidade** | Seções do PRD | Tarefas técnicas |

---

## 6️⃣ COMO USAR ESTES PROMPTS

### Para Modificar o Comportamento do Chat
1. Edite `components/Chat.tsx` - variável `systemInstruction`
2. Modifique o método de interação, seções, ou perguntas
3. O servidor Vite recarrega automaticamente (HMR)

### Para Modificar o Gerador de Tarefas
1. Edite `services/geminiService.ts` - variável `masterPrompt`
2. Ajuste como as tarefas são geradas ou agrupadas
3. Atualize o `responseSchema` se mudar a estrutura de saída

### Para Adicionar Novas Seções
1. No `systemInstruction`: Adicione à lista de seções
2. Em `types.ts`: Atualize `PrdSectionData` com novo campo
3. No `masterPrompt`: Inclua na documentação de entrada
4. Em `Chat.tsx`: Atualize lógica de sumarização se necessário

---

## 7️⃣ PARÂMETROS DA API GEMINI

### Chamada do Chat
```typescript
chatRef.current = genAI.chats.create({
  model: 'gemini-2.5-flash',
  config: { 
    systemInstruction  // Usa systemInstruction definido acima
  },
});
```

### Chamada de Geração (PRD + Tarefas)
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-pro',
  contents: promptContent,
  config: {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
    temperature: 0.2,  // Baixa temperatura = menos criativo, mais determinístico
  },
});
```

---

## 📊 RESUMO EXECUTIVO

| Componente | Modelo | Prompt | Saída | Propósito |
|-----------|--------|--------|-------|-----------|
| **Chat** | Gemini 2.5 Flash | systemInstruction | Texto conversacional | Coleta iterativa de dados |
| **Gerador** | Gemini 2.5 Pro | masterPrompt | JSON estruturado | Geração de PRD + Tarefas |

**Total de Prompts:** 2  
**Total de Linhas:** ~100  
**Versão:** 1.0  
**Data:** 3 de Novembro de 2025  
