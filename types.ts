
export type PrdSectionId = 'visao_geral' | 'escopo' | 'personas' | 'requisitos_funcionais' | 'requisitos_nao_funcionais' | 'design_ux' | 'fluxo_usuario' | 'metricas_sucesso' | 'dependencias_riscos' | 'questoes_abertas';

export interface PrdSection {
  id: PrdSectionId;
  title: string;
}

export interface PrdSectionData {
  visao_geral: string;
  escopo: string;
  personas: string;
  requisitos_funcionais: string;
  requisitos_nao_funcionais: string;
  design_ux: string;
  fluxo_usuario: string;
  metricas_sucesso: string;
  dependencias_riscos: string;
  questoes_abertas: string;
}

export interface FormData {
  product_name: string;
  main_objective: string;
  team: string;
  tech_stack: string;
  custom_tech_stack: string;
  prd_sections: PrdSectionData;
}

export interface TechStack {
    id: string;
    name: string;
    description: string;
}

export interface GeneratedTask {
  feature: string;
  task_title: string;
  task_description: string;
  key_requirements: string[];
  external_dependencies: string;
  known_gotchas: string;
}

export interface GeneratedOutput {
  prd_markdown: string;
  tasks_json: GeneratedTask[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}