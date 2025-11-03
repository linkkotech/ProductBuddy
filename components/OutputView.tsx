
import React from 'react';
import type { GeneratedOutput, GeneratedTask } from '../types';
import TaskCard from './TaskCard';
import { ArrowLeftIcon, ClipboardIcon, DownloadIcon } from './icons';

interface OutputViewProps {
  output: GeneratedOutput;
  onBack: () => void;
}

// A simple markdown renderer component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Basic markdown to HTML conversion
    const htmlContent = content
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-5 border-b border-gray-600 pb-2">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
        .replace(/\n/g, '<br />');

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


const OutputView: React.FC<OutputViewProps> = ({ output, onBack }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const copyAllTasksAsMarkdown = () => {
    const markdown = output.tasks_json.map(task => 
      `### ${task.task_title} (${task.feature})\n\n` +
      `**Descrição:** ${task.task_description}\n\n` +
      `**Requisitos Chave:**\n${task.key_requirements.map(r => `- ${r}`).join('\n')}\n\n` +
      `**Dependências:** ${task.external_dependencies}\n\n` +
      `**Pontos de Atenção:** ${task.known_gotchas}\n\n---\n`
    ).join('\n');
    handleCopy(markdown);
  };
  
  const escapeCsvField = (field: string) => {
    return `"${field.replace(/"/g, '""')}"`;
  };

  const exportTasksAsCsv = () => {
    const header = ["Nome da Tarefa", "Status", "Responsável", "Data de Vencimento", "Prioridade", "Descrição", "Funcionalidade"];
    const rows = output.tasks_json.map(task => [
      escapeCsvField(task.task_title),
      "A Fazer",
      "", // Assignee
      "", // Due Date
      "", // Priority
      escapeCsvField(`${task.task_description}\n\nRequisitos Chave:\n${task.key_requirements.join('\n')}`),
      escapeCsvField(task.feature)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "productbuddy_tarefas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
                    <ArrowLeftIcon className="w-5 h-5" /> Voltar ao Formulário
                </button>
                <h1 className="text-3xl font-bold text-white">Resultado Gerado</h1>
                <div>{/* Placeholder for alignment */}</div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PRD Column */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Documento de Requisitos do Produto</h2>
                        <button onClick={() => handleCopy(output.prd_markdown)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">
                            <ClipboardIcon className="w-4 h-4" /> Copiar
                        </button>
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300">
                        <MarkdownRenderer content={output.prd_markdown} />
                    </div>
                </div>

                {/* Tasks Column */}
                <div className="space-y-6">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Lista de Tarefas Acionáveis</h2>
                            <div className="flex gap-2">
                                <button onClick={copyAllTasksAsMarkdown} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">
                                    <ClipboardIcon className="w-4 h-4" /> Copiar Tudo
                                </button>
                                <button onClick={exportTasksAsCsv} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-gray-700 hover:bg-gray-600 transition">
                                    <DownloadIcon className="w-4 h-4" /> Exportar CSV
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        {output.tasks_json.map((task, index) => (
                            <TaskCard key={index} task={task} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default OutputView;
