
import type { TechStack, PrdSection } from './types';

export const TECH_STACKS: TechStack[] = [
  {
    id: 'nextjs-supabase',
    name: 'Next.js & Supabase',
    description: 'Next.js 15, React 19, Tailwind CSS, shadcn/ui, Supabase',
  },
  {
    id: 'vue-firebase',
    name: 'Vue & Firebase',
    description: 'Vue 3, Nuxt.js, Tailwind CSS, PrimeVue, Firebase',
  },
  {
    id: 'react-express',
    name: 'React & Express',
    description: 'React 19 (Vite), Express.js, PostgreSQL, Prisma, Tailwind CSS',
  },
  {
    id: 'custom',
    name: 'Stack Personalizada',
    description: 'Especifique sua própria stack de tecnologia.',
  }
];

export const PRD_ACCORDION_SECTIONS: PrdSection[] = [
  { id: 'visao_geral', title: 'Visão Geral' },
  { id: 'escopo', title: 'Escopo (In / Out)' },
  { id: 'personas', title: 'Personas' },
  { id: 'requisitos_funcionais', title: 'Requisitos Funcionais' },
  { id: 'requisitos_nao_funcionais', title: 'Requisitos Não Funcionais' },
  { id: 'design_ux', title: 'Design e UX' },
  { id: 'fluxo_usuario', title: 'Fluxo de Usuário' },
  { id: 'metricas_sucesso', title: 'Métricas de Sucesso' },
  { id: 'dependencias_riscos', title: 'Dependências e Riscos' },
  { id: 'questoes_abertas', title: 'Questões em Aberto' },
];
