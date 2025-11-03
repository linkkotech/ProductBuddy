
import React, { useState, useCallback } from 'react';
import { TECH_STACKS } from './constants';
import type { FormData, PrdSectionData, GeneratedOutput, TechStack } from './types';
import { generateProductDocuments } from './services/geminiService';
import Card from './components/Card';
import Input from './components/Input';
import Textarea from './components/Textarea';
import TechStackSelector from './components/TechStackSelector';
import Button from './components/Button';
import OutputView from './components/OutputView';
import Chat from './components/Chat';
import ProgressBar from './components/ProgressBar';
import { SparklesIcon } from './components/icons';

const STEPS = ["Detalhes do Projeto", "Stack de Tecnologia", "Conteúdo do PRD"];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'output'>('form');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPrdContentComplete, setIsPrdContentComplete] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormData>({
    product_name: '',
    main_objective: '',
    team: '',
    tech_stack: TECH_STACKS[0].id,
    custom_tech_stack: '',
    prd_sections: {
      visao_geral: '',
      escopo: '',
      personas: '',
      requisitos_funcionais: '',
      requisitos_nao_funcionais: '',
      design_ux: '',
      fluxo_usuario: '',
      metricas_sucesso: '',
      dependencias_riscos: '',
      questoes_abertas: '',
    },
  });
  
  const [generatedOutput, setGeneratedOutput] = useState<GeneratedOutput | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePrdGenerationComplete = useCallback((updatedSections: PrdSectionData) => {
    setFormData(prev => ({
      ...prev,
      prd_sections: updatedSections,
    }));
    setIsPrdContentComplete(true);
  }, []);

  const handleTechStackChange = useCallback((stack: TechStack) => {
    setFormData(prev => ({ ...prev, tech_stack: stack.id, custom_tech_stack: '' }));
  }, []);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPrdContentComplete) {
      setError("Por favor, complete a seção de conteúdo do PRD via chat antes de gerar os documentos.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const techStackDetails = TECH_STACKS.find(s => s.id === formData.tech_stack);
    const finalTechStack = formData.tech_stack === 'custom' 
      ? formData.custom_tech_stack 
      : techStackDetails?.description || '';

    try {
      const result = await generateProductDocuments({ ...formData, tech_stack: finalTechStack });
      setGeneratedOutput(result);
      setCurrentView('output');
    } catch (err) {
      console.error("Error generating documents:", err);
      setError("Falha ao gerar os documentos. Verifique o console para mais detalhes.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToForm = () => {
    setCurrentView('form');
    setGeneratedOutput(null);
  }

  if (currentView === 'output' && generatedOutput) {
    return <OutputView output={generatedOutput} onBack={handleBackToForm} />;
  }
  
  const isStep1Valid = formData.product_name && formData.main_objective && formData.team;
  const isStep2Valid = formData.tech_stack !== 'custom' || (formData.tech_stack === 'custom' && formData.custom_tech_stack);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white flex items-center justify-center gap-3">
            ProductBuddy AI <span className="text-yellow-400">✨</span>
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Preencha o formulário abaixo para gerar um PRD completo e uma lista de tarefas técnicas para sua equipe.
          </p>
        </header>
        
        <ProgressBar currentStep={currentStep} steps={STEPS} />

        {currentStep === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-8">
            <Card title="Detalhes do Projeto">
              <div className="space-y-4">
                <Input label="Nome do Produto" name="product_name" value={formData.product_name} onChange={handleInputChange} required />
                <Textarea label="Objetivo Principal" name="main_objective" value={formData.main_objective} onChange={handleInputChange} rows={3} required />
                <Input label="Equipe / Stakeholders" name="team" value={formData.team} onChange={handleInputChange} required />
              </div>
              <div className="mt-6 flex justify-end">
                  <Button type="submit" disabled={!isStep1Valid}>
                      Próxima Etapa &rarr;
                  </Button>
              </div>
            </Card>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-8">
            <Card title="Stack de Tecnologia" description="Selecione a stack de tecnologia do seu projeto para gerar tarefas mais precisas.">
              <TechStackSelector
                stacks={TECH_STACKS}
                selectedStackId={formData.tech_stack}
                onSelect={handleTechStackChange}
              />
              {formData.tech_stack === 'custom' && (
                <div className="mt-4">
                  <Input
                    label="Outra / Stack Personalizada"
                    name="custom_tech_stack"
                    value={formData.custom_tech_stack}
                    onChange={handleInputChange}
                    placeholder="ex: SvelteKit, Deno, MongoDB"
                    required
                  />
                </div>
              )}
              <div className="mt-6 flex justify-between items-center">
                  <Button type="button" onClick={prevStep} className="bg-transparent hover:bg-gray-700 text-gray-300">
                      &larr; Voltar
                  </Button>
                  <Button type="submit" disabled={!isStep2Valid}>
                      Próxima Etapa &rarr;
                  </Button>
              </div>
            </Card>
          </form>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <Card 
              title="Conteúdo do PRD" 
              description={isPrdContentComplete 
                ? "✅ Conteúdo do PRD preenchido via chat!" 
                : "Converse com nosso assistente para preencher os detalhes do PRD."}
            >
              <Chat 
                onPrdGenerationComplete={handlePrdGenerationComplete}
                productName={formData.product_name}
                mainObjective={formData.main_objective}
                team={formData.team}
              />
               <div className="mt-6 flex justify-between items-center">
                  <Button type="button" onClick={prevStep} className="bg-transparent hover:bg-gray-700 text-gray-300">
                      &larr; Voltar
                  </Button>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    {isPrdContentComplete && (
                      <Button type="submit" isLoading={isLoading}>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Gerar PRD e Tarefas
                      </Button>
                    )}
                  </form>
              </div>
            </Card>
          </div>
        )}
        
        {error && <p className="text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default App;
