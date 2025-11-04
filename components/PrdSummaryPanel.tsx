import React from 'react';
import type { PrdSectionData } from '../types';
import Card from './Card';

interface PrdSummaryPanelProps {
  prdData: PrdSectionData;
  currentSectionIndex: number;
  extractedCount: number;
}

// Mapa de seções com títulos legíveis e ícones
const SECTION_DISPLAY: Record<keyof PrdSectionData, { title: string; icon: string }> = {
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
};

const PrdSummaryPanel: React.FC<PrdSummaryPanelProps> = ({
  prdData,
  currentSectionIndex,
  extractedCount
}) => {
  const progressPercentage = Math.round((extractedCount / 10) * 100);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Progress Section */}
      <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-300">📊 Progresso</span>
            <span className="text-xs text-gray-400">{extractedCount}/10 seções</span>
          </div>
          <span className="text-sm font-bold text-green-400">{progressPercentage}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-600 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Current Section Info */}
        <div className="mt-3 text-xs text-gray-400">
          <span>Seção atual: {currentSectionIndex + 1}/10</span>
          {currentSectionIndex < 10 && (
            <span className="ml-2 text-blue-300">
              → {SECTION_DISPLAY[Object.keys(prdData)[currentSectionIndex] as keyof PrdSectionData]?.title || 'Próxima'}
            </span>
          )}
        </div>
      </div>

      {/* Sections Container - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {Object.entries(prdData).map(([key, content], index) => {
          const isExtracted = typeof content === 'string' && content.trim().length > 0;
          const sectionKey = key as keyof PrdSectionData;
          const sectionInfo = SECTION_DISPLAY[sectionKey];
          const isCurrent = index === currentSectionIndex;

          return (
            <Card
              key={key}
              title={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sectionInfo.icon}</span>
                    <span className="font-semibold text-gray-100">{sectionInfo.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExtracted && (
                      <span className="text-xs px-2 py-1 bg-green-900/50 text-green-300 rounded-full border border-green-700">
                        ✅ Extraída
                      </span>
                    )}
                    {!isExtracted && isCurrent && (
                      <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700 animate-pulse">
                        ⏳ Atual
                      </span>
                    )}
                    {!isExtracted && !isCurrent && (
                      <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full border border-yellow-700">
                        🚧 Pendente
                      </span>
                    )}
                  </div>
                </div>
              }
              description={
                isExtracted ? (
                  <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                    {content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    🚧 Aguardando informações do chat...
                  </p>
                )
              }
            />
          );
        })}
      </div>

      {/* Footer - Completion Status */}
      {extractedCount === 10 ? (
        <div className="p-3 bg-green-900/30 border border-green-700 rounded-lg">
          <p className="text-sm text-green-300 font-semibold">
            🎉 Todas as seções foram extraídas com sucesso!
          </p>
          <p className="text-xs text-green-400 mt-1">
            Clique em "Finalizar e Gerar PRD" para gerar documentos e tarefas.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
          <p className="text-sm text-blue-300 font-semibold">
            💬 Continue conversando para preencher as seções.
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Faltam {10 - extractedCount} seção(ões). Aprove cada uma para extrair.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrdSummaryPanel;
