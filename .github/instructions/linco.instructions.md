# CONTEXTO E REGRAS PARA O PROJETO ProductBuddy AI

## 1. Stack de Tecnologia Principal (Tech Stack)
O código gerado deve ser estritamente compatível com esta stack:
- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **React:** React 19 (Componentes Funcionais com Hooks)
- **Estilização:** Tailwind CSS 4
- **Componentes de UI:** shadcn/ui. Use componentes de `@/components/ui` sempre que possível.
- **Backend e Autenticação:** Supabase, usando o pacote `@supabase/ssr`.
- **Formulários:** React Hook Form com Zod para validação de schemas.
- **Armazenamento:** Supabase Storage configurado para usar um bucket AWS S3.

## 2. Padrões de Arquitetura
- **Multi-Tenancy:** A arquitetura é multi-tenant. A maioria das tabelas de negócio DEVE conter uma coluna `workspace_id` para ser usada com Row Level Security (RLS).
- **Componentes:** Server Components são o padrão. Adicione a diretiva `"use client"` apenas quando estritamente necessário (interatividade, hooks de estado como `useState` ou `useEffect`).
- **Importações:** Use sempre importações absolutas com o alias `@/` (ex: `import { Button } from '@/components/ui/button'`).
- **Tipos:** As definições de tipo globais estão em `types/index.d.ts`.

## 3. Fluxo de Trabalho e Interação
- **Plano de Execução OBRIGATÓRIO:** Para qualquer tarefa, sua PRIMEIRA resposta DEVE ser um plano de execução objetivo e conciso em formato de lista. Não use formatação de arquivo Markdown nem prosa excessiva. Apenas as etapas técnicas.
- **Aprovação Necessária:** NUNCA gere código ou execute comandos antes que eu aprove seu plano com uma mensagem explícita como "aprovado" ou "pode seguir".

## 4. Regras de Saída e Criação de Arquivos (REGRA ESTRITA)
- **PROIBIÇÃO DE ARQUIVOS DE RELATÓRIO:** **NÃO CRIE** arquivos de resumo, log, checklist, guia ou qualquer outro tipo de arquivo Markdown (`.md`) para documentar suas ações ou progresso. Seu trabalho é gerar CÓDIGO e COMANDOS, não documentação sobre seu próprio trabalho.
- **Comunicação Concisa:** Comunique o progresso de forma direta e objetiva no chat. Exemplo: "Plano aprovado. Gerando o código para a Etapa 1...", em vez de "Perfeito! Agora vou criar um documento de resumo...".
- **Exceção para Documentação:** A ÚNICA exceção para criar arquivos `.md` é se eu solicitar explicitamente a criação de um documento de projeto, que deve ser salvo exclusivamente na pasta `project-info/`.