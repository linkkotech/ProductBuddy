
import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeneratedOutput } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("A variável de ambiente VITE_GEMINI_API_KEY não está definida. Verifique o arquivo .env.local");
}

const ai = new GoogleGenAI({ apiKey });

const masterPrompt = `
# PROMPT MESTRE: GERADOR DE PRD E TAREFAS TÉCNICAS (PRODUCTBUDDY)

## CONTEXTO GERAL
Você é o ProductBuddy 🛠️, um assistente de IA especialista em produto e engenharia de software. Sua única função é receber um conjunto de dados de um formulário e, com base neles, gerar um PRD completo e uma lista de tarefas técnicas detalhadas. Você NUNCA se desvia deste formato de saída.

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

1.  **Gerar o PRD:** Usando os dados de entrada, monte um documento Markdown bem formatado e profissional. Comece com o product_name como título principal (#). Use os títulos das seções do PRD como subtítulos (##).

2.  **Gerar a Lista de Tarefas:**
    - Analise profundamente as seções \`requisitos_funcionais\`, \`fluxo_usuario\`, e \`design_ux\`.
    - Considere a \`tech_stack\` informada para tornar as tarefas específicas e relevantes (ex: "Criar componente React", "Configurar endpoint Express", "Definir schema Prisma").
    - Quebre o trabalho em tarefas granulares e acionáveis, agrupadas por funcionalidade principal (Backend, Frontend, Banco de Dados, DevOps, etc.).
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
Sua saída final deve ser um objeto JSON contendo o PRD e a lista de tarefas, que corresponda EXATAMENTE ao schema fornecido. Não adicione nenhuma explicação ou texto fora do objeto JSON.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    prd_markdown: { type: Type.STRING },
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
        required: ['feature', 'task_title', 'task_description', 'key_requirements', 'external_dependencies', 'known_gotchas'],
      },
    },
  },
  required: ['prd_markdown', 'tasks_json'],
};


export const generateProductDocuments = async (formData: Omit<FormData, 'custom_tech_stack'>): Promise<GeneratedOutput> => {
  const model = 'gemini-2.5-pro';

  const promptContent = `${masterPrompt}\n\n## DADOS DE ENTRADA FORNECIDOS:\n${JSON.stringify(formData, null, 2)}`;
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: promptContent,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as GeneratedOutput;
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao gerar o conteúdo da API Gemini.");
  }
};

/**
 * ETAPA 1: Extrai o conteúdo de UMA ÚNICA seção do PRD baseado no histórico da conversa.
 * Usa gemini-2.5-pro com sumarização incremental para evitar token limit.
 * 
 * @param conversationHistory - Array de objetos com histórico do chat
 * @param sectionName - Nome da seção (ex: "visao_geral", "personas", etc)
 * @returns Promise<string | null> - Conteúdo extraído ou null em caso de erro
 */
export const extractSectionContent = async (
  conversationHistory: any[],
  sectionName: string
): Promise<string | null> => {
  const model = 'gemini-2.5-pro';
  
  // Mapa de nomes para títulos legíveis
  const sectionTitles: Record<string, string> = {
    visao_geral: 'Visão Geral',
    escopo: 'Escopo',
    personas: 'Personas',
    requisitos_funcionais: 'Requisitos Funcionais',
    requisitos_nao_funcionais: 'Requisitos Não Funcionais',
    design_ux: 'Design e Experiência do Usuário (UX)',
    fluxo_usuario: 'Fluxo de Usuário',
    metricas_sucesso: 'Métricas de Sucesso',
    dependencias_riscos: 'Dependências e Riscos',
    questoes_abertas: 'Questões em Aberto'
  };

  const sectionTitle = sectionTitles[sectionName] || sectionName;

  const extractionPrompt = `
Você é um especialista em análise de PRD (Product Requirements Document).

Analise o histórico da conversa abaixo e extraia um resumo completo, bem estruturado 
e profissional para a seção do PRD intitulada: "${sectionTitle}".

Histórico da Conversa:
${conversationHistory
  .map((msg: any) => {
    const role = msg.role === 'model' ? '🤖 Assistente' : '👤 Usuário';
    return `${role}: ${msg.content}`;
  })
  .join('\n\n')}

Retorne APENAS o conteúdo desta seção em um JSON estruturado. Não inclua o 
nome da seção no resultado, apenas seu conteúdo completo e bem formatado.

Importante:
- Mantenha o tom profissional e claro
- Organize o conteúdo em forma de tópicos se necessário
- Use a formatação Markdown quando apropriado (listas, negrito, etc)
`;

  const sectionSchema = {
    type: Type.OBJECT,
    properties: {
      sectionContent: { type: Type.STRING }
    },
    required: ['sectionContent']
  };

  try {
    console.log(`📤 Extraindo seção: "${sectionTitle}"`);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: extractionPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: sectionSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as { sectionContent: string };
    
    console.log(`📥 Seção "${sectionTitle}" extraída com sucesso (${result.sectionContent.length} caracteres)`);
    return result.sectionContent;
    
  } catch (error) {
    console.error(`❌ Erro ao extrair seção "${sectionTitle}":`, error);
    return null;
  }
};

/**
 * ETAPA 2: Detecta se a última mensagem do usuário indica aprovação da seção.
 * Usa gemini-2.5-flash para classificação binária rápida.
 * 
 * @param lastUserMessage - Última mensagem enviada pelo usuário
 * @returns Promise<boolean> - True se validado, false caso contrário
 */
export const isSectionValidatedByUser = async (
  lastUserMessage: string
): Promise<boolean> => {
  const model = 'gemini-2.5-flash';

  const validationPrompt = `
Você é um classificador binário de aprovação de conteúdo.

A pergunta é: O usuário está aprovando/validando a seção do PRD que acabou de ser 
discutida? 

Mensagem do usuário: "${lastUserMessage}"

Retorne APENAS "true" se o usuário está aprovando (exemplos: "ótimo", "está bom", 
"próxima seção", "sim", "pode ir", "perfeito", "OK", "valida", "achei bom", etc.) 
ou "false" caso contrário (se ainda quer discussão, dúvidas, revisões, etc).

Seja leniente com variações e abreviações do português.
`;

  const validationSchema = {
    type: Type.OBJECT,
    properties: {
      isValidated: { type: Type.BOOLEAN }
    },
    required: ['isValidated']
  };

  try {
    console.log(`🔍 Analisando validação de seção: "${lastUserMessage.substring(0, 50)}..."`);
    
    const response = await ai.models.generateContent({
      model: model,
      contents: validationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: validationSchema,
        temperature: 0.1, // Muito baixo para classificação consistente
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText) as { isValidated: boolean };
    
    console.log(`✅/❌ Resultado da validação:`, result.isValidated ? '✅ APROVADO' : '⏳ EM DISCUSSÃO');
    return result.isValidated;
    
  } catch (error) {
    console.error("❌ Erro ao validar seção:", error);
    // Em caso de erro, retornar false (continuar discussão)
    return false;
  }
};
