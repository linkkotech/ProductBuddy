
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat as GeminiChat, Type } from "@google/genai";
import type { PrdSectionData, ChatMessage } from '../types';
import { createBlob } from '../utils/audio';
import { BotIcon, UserIcon, SendIcon, MicIcon, StopCircleIcon, Loader2Icon } from './icons';
import Button from './Button';
import { extractSectionContent, isSectionValidatedByUser } from '../services/geminiService';

const systemInstruction = `Prompt Final: Facilitador de PRD Interativo (ProductBuddy)

CONTEXTO:

O objetivo é elaborar um PRD (Product Requirements Document) de forma interativa, incremental e colaborativa. O Agente Gemini atuará como um facilitador de produto (ProductBuddy), guiando a construção do documento por partes, validando cada seção com o usuário e sugerindo boas práticas, exemplos e melhorias.

INTENÇÃO:

O objetivo é construir um PRD de alta qualidade, seguindo uma estrutura moderna e prática. Para isso, o Agente Gemini (ProductBuddy) deve conduzir o processo respeitando o MÉTODO DE INTERAÇÃO, garantindo que o documento final seja claro, completo e acionável.

MÉTODO DE INTERAÇÃO:

    O Agente Gemini se apresenta como ProductBuddy. Ele recebe as informações iniciais (nome do produto, objetivo, equipe) como contexto inicial. Com base nisso, ele sugere iniciar pela primeira seção ("Visão Geral"), mas oferece ao usuário a flexibilidade de escolher outra seção se preferir.

    Para cada seção, o ProductBuddy solicita as informações necessárias (ex: para a "Visão Geral", pede o "porquê" da iniciativa). Oferece exemplos e estrutura se o usuário pedir ajuda.

    Seu único papel no chat é fazer perguntas para coletar as informações de cada seção do PRD de forma conversacional. NÃO FAÇA RESUMOS no chat. O resumo aparecerá automaticamente em outro painel para o usuário.

    Após sentir que coletou informação suficiente para uma seção, pergunte de forma direta e simples se o usuário está pronto para validar e prosseguir. Exemplo: "Temos o suficiente para a seção de Personas? Podemos validar e passar para a próxima?"

    Quando o usuário confirmar que quer validar, o ProductBuddy passa para a próxima seção da lista:

        Visão Geral

        Escopo (In / Out)

        Personas

        Requisitos Funcionais

        Requisitos Não Funcionais

        Design e Experiência do Usuário (UX)

        Fluxo de Usuário

        Métricas de Sucesso (Nesta seção, lembre-se de conectar as métricas com os objetivos definidos na Visão Geral)

        Dependências e Riscos

        Questões em Aberto

DESVIOS POSSÍVEIS:

    Se o usuário solicitar um resumo, o Agente Gemini (ProductBuddy) deve gerar a versão atual do PRD com as seções já preenchidas.

    Se o usuário quiser reescrever uma seção, o Agente Gemini (ProductBuddy) deve reabrir apenas aquela parte e voltar ao passo anterior.

    Se o usuário quiser exportar, o Agente Gemini (ProductBuddy) deve gerar o PRD em formato Markdown ou outro solicitado.

    Se o usuário quiser adicionar seções customizadas, o Agente Gemini (ProductBuddy) deve perguntar o nome, a intenção e o tipo de conteúdo da seção.

CONDIÇÃO PARA INFORMAÇÃO INSUFICIENTE:

Se o usuário responder de forma vaga, ProductBuddy deve:

    Solicitar mais contexto de forma amigável.

    Oferecer 2 a 3 exemplos de respostas para inspirar.

    Explicar por que essa informação é essencial para a qualidade da seção.

FORMATO:

O painel de resumo (PRD Summary) será atualizado automaticamente com as seções validadas. Seu foco deve ser apenas na coleta conversacional de dados, não na apresentação de resumos.
`;

interface ChatProps {
  onPrdGenerationComplete: (sections: PrdSectionData) => void;
  productName: string;
  mainObjective: string;
  team: string;
  prdSectionData: PrdSectionData;
  setPrdSectionData: React.Dispatch<React.SetStateAction<PrdSectionData>>;
  currentSectionIndex: number;
  setCurrentSectionIndex: React.Dispatch<React.SetStateAction<number>>;
  extractedSections: Set<string>;
  setExtractedSections: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const Chat: React.FC<ChatProps> = ({ 
  onPrdGenerationComplete,
  productName,
  mainObjective,
  team,
  prdSectionData: prdSectionDataProp,
  setPrdSectionData: setPrdSectionDataProp,
  currentSectionIndex: currentSectionIndexProp,
  setCurrentSectionIndex: setCurrentSectionIndexProp,
  extractedSections: extractedSectionsProp,
  setExtractedSections: setExtractedSectionsProp
}) => {
  // Array de seções em ordem (do systemInstruction)
  const SECTION_NAMES: (keyof PrdSectionData)[] = [
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

  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [recordingError, setRecordingError] = useState<string>('');
  const [isChatReady, setIsChatReady] = useState(false);
  const [isNewSectionTurn, setIsNewSectionTurn] = useState(true);
  
  // Use props para rastrear qual seção está sendo discutida e dados acumulados
  const currentSectionIndex = currentSectionIndexProp;
  const setCurrentSectionIndex = setCurrentSectionIndexProp;
  const prdSectionData = prdSectionDataProp;
  const setPrdSectionData = setPrdSectionDataProp;
  const extractedSections = extractedSectionsProp;
  const setExtractedSections = setExtractedSectionsProp;
  
  const chatRef = useRef<GeminiChat | null>(null);
  const liveSessionRef = useRef<any>(null);
  const audioInfrastructureRef = useRef<{
    context: AudioContext,
    stream: MediaStream,
    processor: ScriptProcessorNode,
    source: MediaStreamAudioSourceNode
  } | null>(null);
  const transcriptionRef = useRef<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedConversation = useRef(false);

  /**
   * [NOVO] Move para a próxima seção após validação da atual.
   * Atualiza currentSectionIndex e notifica o usuário.
   */
  const moveToNextSection = useCallback(() => {
    if (currentSectionIndex < SECTION_NAMES.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setIsNewSectionTurn(true);
      
      const currentSectionName = SECTION_NAMES[currentSectionIndex];
      const nextSectionName = SECTION_NAMES[nextIndex];
      
      setStatusMessage(`✅ Seção '${currentSectionName}' extraída com sucesso!`);
      console.log(`📍 Movendo para seção ${nextIndex + 1}/10: ${nextSectionName}`);
    } else {
      console.log('🎉 Todas as seções foram preenchidas!');
      setStatusMessage('🎉 Todas as seções foram preenchidas! Clique em "Finalizar" para gerar o PRD.');
    }
  }, [currentSectionIndex]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    console.log('Inicializando Chat - API Key presente:', !!apiKey);
    if (apiKey) {
        const genAI = new GoogleGenAI({ apiKey });
        setAi(genAI);
        chatRef.current = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });
        setIsChatReady(true);
        console.log('✅ Chat inicializado com sucesso');
    } else {
        console.error("❌ VITE_GEMINI_API_KEY não está definida no .env.local");
        setStatusMessage('❌ Erro: API Key não configurada. Verifique o arquivo .env.local');
        setIsChatReady(false);
    }
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const startConversation = useCallback(async () => {
    if (!chatRef.current || !productName || !mainObjective || !team) {
      console.warn('startConversation: faltam dados', { 
        chatReady: !!chatRef.current, 
        productName, 
        mainObjective, 
        team 
      });
      return;
    }
    
    hasStartedConversation.current = true;
    setIsLoading(true);
    setMessages([]);
    setStatusMessage('Iniciando conversa com ProductBuddy...');

    const initialUserContext = `Aqui estão as informações iniciais do projeto que preenchi no formulário:\n- Nome do Produto: ${productName}\n- Objetivo Principal: ${mainObjective}\n- Equipe/Stakeholders: ${team}`;
    const assistantMessageId = `model-initial-${Date.now()}`;

    try {
        console.log('📤 Enviando contexto inicial para chat...');
        const responseStream = await chatRef.current.sendMessageStream({ message: initialUserContext });
        
        let fullResponse = '';
        let modelMessageAdded = false;
  
        for await (const chunk of responseStream) {
          fullResponse += chunk.text;
          
          if (!modelMessageAdded) {
            setMessages([{ id: assistantMessageId, role: 'model', content: fullResponse }]);
            modelMessageAdded = true;
          } else {
            setMessages(prev => {
              const newMessages = [...prev];
              const msgIndex = newMessages.findIndex(m => m.id === assistantMessageId);
              if (msgIndex !== -1) {
                // FIX: Corrected state mutation by creating a new object.
                newMessages[msgIndex] = { ...newMessages[msgIndex], content: fullResponse };
              }
              return newMessages;
            });
          }
        }
        console.log('✅ Conversa iniciada com sucesso');
        setStatusMessage('');
    } catch (error) {
        console.error("❌ Erro ao iniciar conversa:", error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
        setMessages([{ id: `model-error-${Date.now()}`, role: 'model', content: `Desculpe, ocorreu um erro ao iniciar a conversa: ${errorMsg}. Por favor, tente preencher os detalhes do projeto novamente.` }]);
        setStatusMessage(`❌ Erro: ${errorMsg}`);
    } finally {
        setIsLoading(false);
    }
  }, [productName, mainObjective, team]);


  useEffect(() => {
    if (!ai || hasStartedConversation.current) return;

    if (productName && mainObjective && team) {
      startConversation();
    } else {
      setMessages([{ id: `model-start-${Date.now()}`, role: 'model', content: 'Por favor, preencha os Detalhes do Projeto acima para começar a nossa conversa.' }]);
    }
  }, [ai, productName, mainObjective, team, startConversation]);


  const sendMessage = async (message: string) => {
    if (!chatRef.current || !message.trim() || isLoading) return;

    // [GUARDA DE SEGURANÇA] Ignorar validação no primeiro turno de uma nova seção
    if (isNewSectionTurn) {
      setIsNewSectionTurn(false);
      console.log('🔒 Primeiro turno da nova seção, validação ignorada.');
      
      setIsLoading(true);
      setUserInput('');

      const userMessage: ChatMessage = { 
        id: `user-${Date.now()}`,
        role: 'user', 
        content: message 
      };
      
      const assistantMessageId = `model-${Date.now()}`;
      const modelPlaceholder: ChatMessage = { 
          id: assistantMessageId,
          role: 'model', 
          content: ''
      };
      
      setMessages(prev => [...prev, userMessage, modelPlaceholder]);
      
      try {
        const responseStream = await chatRef.current.sendMessageStream({ message });
        
        let accumulatedResponse = '';
        for await (const chunk of responseStream) {
          accumulatedResponse += chunk.text;
          setMessages(currentMessages => {
              const newMessages = [...currentMessages];
              const lastIndex = newMessages.length - 1;
              if (lastIndex >= 0 && newMessages[lastIndex].id === assistantMessageId) {
                newMessages[lastIndex] = { ...newMessages[lastIndex], content: accumulatedResponse };
              }
              return newMessages;
          });
        }
        
        setMessages(currentMessages => [...currentMessages]);
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setUserInput('');

    const userMessage: ChatMessage = { 
      id: `user-${Date.now()}`,
      role: 'user', 
      content: message 
    };
    
    const assistantMessageId = `model-${Date.now()}`;
    const modelPlaceholder: ChatMessage = { 
        id: assistantMessageId,
        role: 'model', 
        content: ''
    };
    
    setMessages(prev => [...prev, userMessage, modelPlaceholder]);
    
    try {
      const responseStream = await chatRef.current.sendMessageStream({ message });
      
      let accumulatedResponse = '';
      for await (const chunk of responseStream) {
        accumulatedResponse += chunk.text;
        setMessages(currentMessages => {
            const newMessages = [...currentMessages];
            const lastIndex = newMessages.length - 1;
            if (lastIndex >= 0 && newMessages[lastIndex].id === assistantMessageId) {
              newMessages[lastIndex] = { ...newMessages[lastIndex], content: accumulatedResponse };
            }
            return newMessages;
        });
      }

      // [NOVO ETAPA 4] Após resposta recebida, validar seção
      setMessages(currentMessages => [...currentMessages]); // Atualizar estado final
      
      console.log('🔍 Verificando se seção foi validada...');
      const isValidated = await isSectionValidatedByUser(message);
      
      if (isValidated) {
        const currentSectionName = SECTION_NAMES[currentSectionIndex];
        console.log(`✅ Seção '${currentSectionName}' validada pelo usuário!`);
        
        // [NOVO ETAPA 4] Extrair conteúdo da seção atual
        setStatusMessage('⏳ Extraindo conteúdo da seção...');
        const extractedContent = await extractSectionContent(
          messages.map(msg => ({ role: msg.role, content: msg.content })) as any[],
          currentSectionName
        );
        
        if (extractedContent) {
          // [NOVO ETAPA 4] Atualizar prdSectionData
          setPrdSectionData(prev => ({
            ...prev,
            [currentSectionName]: extractedContent
          }));
          
          // [NOVO ETAPA 4] Registrar extração
          setExtractedSections(prev => new Set([...prev, currentSectionName]));
          
          console.log(`📊 prdSectionData atualizado:`, prdSectionData);
          console.log(`🎯 Seções extraídas:`, Array.from(extractedSections));
          
          // [NOVO ETAPA 4] Transição para próxima seção
          moveToNextSection();
        } else {
          console.error(`❌ Falha ao extrair conteúdo de '${currentSectionName}'`);
          setStatusMessage(`❌ Erro ao extrair seção '${currentSectionName}'. Tente novamente.`);
        }
      } else {
        console.log('⏳ Usuário ainda está preenchendo a seção...');
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(currentMessages => {
          const newMessages = [...currentMessages];
          const lastIndex = newMessages.length - 1;
          if (lastIndex >= 0 && newMessages[lastIndex].id === assistantMessageId) {
            // FIX: Corrected state mutation by creating a new object for the error message.
            newMessages[lastIndex] = { ...newMessages[lastIndex], content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' };
          }
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
  };

  const toggleRecording = async () => {
    if (!ai) return;

    if (isRecording) {
      // Stop recording
      liveSessionRef.current?.close();
      liveSessionRef.current = null;
      audioInfrastructureRef.current?.stream.getTracks().forEach(track => track.stop());
      audioInfrastructureRef.current?.processor.disconnect();
      audioInfrastructureRef.current?.source.disconnect();
      audioInfrastructureRef.current = null;
      setIsRecording(false);
      if (transcriptionRef.current.trim()) {
        sendMessage(transcriptionRef.current);
      }
      transcriptionRef.current = '';
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // FIX: Cast window to any to support webkitAudioContext for broader browser compatibility.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);
        
        // FIX: Initiate the connection first to get the session promise.
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
              onopen: () => setIsRecording(true),
              onmessage: (message: any) => {
                if (message.serverContent?.inputTranscription) {
                  transcriptionRef.current += message.serverContent.inputTranscription.text;
                }
              },
              onerror: (e: any) => console.error("Live session error:", e),
              onclose: () => setIsRecording(false),
            },
            config: { inputAudioTranscription: {} },
        });
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          // FIX: Use sessionPromise.then() to avoid race conditions and ensure the session is active before sending data.
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };

        source.connect(processor);
        processor.connect(context.destination);

        liveSessionRef.current = await sessionPromise;
        audioInfrastructureRef.current = { stream, context, source, processor };
      } catch (error) {
        console.error("Error starting recording:", error);
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao acessar o microfone';
        setRecordingError(`Não foi possível acessar o microfone: ${errorMsg}. Verifique as permissões de áudio do navegador.`);
        setIsRecording(false);
        // Auto-clear error after 5 seconds
        setTimeout(() => setRecordingError(''), 5000);
      }
    }
  };

  const handleSummarize = async () => {
    console.log('🚀 Iniciando geração final de documentos...');
    
    // [NOVO ETAPA 5] Verificar se todas as 10 seções foram preenchidas
    const allSectionsFilled = Object.values(prdSectionData).every(
      section => typeof section === 'string' && section.trim().length > 0
    );
    
    if (!allSectionsFilled) {
      const missingCount = Object.entries(prdSectionData)
        .filter(([_, content]) => !content || (typeof content === 'string' && !content.trim()))
        .length;
      
      const missingSections = Object.entries(prdSectionData)
        .filter(([_, content]) => !content || (typeof content === 'string' && !content.trim()))
        .map(([key]) => key)
        .join(', ');
      
      setStatusMessage(`⚠️ ${missingCount} seção(ões) ainda não foram extraída(s). Faltam: ${missingSections}`);
      setTimeout(() => setStatusMessage(''), 5000);
      return;
    }

    setIsSummarizing(true);
    setStatusMessage('✅ Todas as seções foram preenchidas! Gerando PRD e tarefas...');
    
    try {
      // [NOVO ETAPA 5] Preparar dados para geração (incluindo prdSectionData já preenchido)
      const generateInput = {
        product_name: productName,
        main_objective: mainObjective,
        team: team,
        prd_sections: prdSectionData
      };
      
      console.log('📋 Dados para geração final:', generateInput);
      
      // [NOVO ETAPA 5] Chamar função de geração (sem mudanças no geminiService)
      const { generateProductDocuments } = await import('../services/geminiService');
      const result = await generateProductDocuments(generateInput as any);
      
      // [NOVO ETAPA 5] Callback para atualizar UI
      onPrdGenerationComplete(result.tasks_json as any); // Passar tarefas ou resultado completo
      
      setStatusMessage('✅ PRD e tarefas geradas com sucesso!');
      console.log('✅ Documentos finais:', result);
      setIsComplete(true);
      
    } catch (error) {
      console.error('❌ Erro na geração final:', error);
      setStatusMessage('❌ Erro ao gerar documentos finais. Tente novamente.');
      setTimeout(() => setStatusMessage(''), 5000);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  if (isComplete) {
      return (
          <div className="text-center p-8 bg-green-900/20 border border-green-700 rounded-lg">
              <h3 className="text-lg font-semibold text-green-300">✅ Conversa finalizada!</h3>
              <p className="text-gray-400 mt-2">O conteúdo do PRD foi extraído com sucesso e preenchido. Você já pode gerar os documentos e tarefas.</p>
          </div>
      )
  }

  if (!isChatReady) {
    return (
      <div className="flex flex-col h-[500px] bg-gray-900/50 border border-gray-700 rounded-lg p-8 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-pulse">⚙️</div>
          <h3 className="text-lg font-semibold text-yellow-300">Inicializando ProductBuddy...</h3>
          <p className="text-gray-400">Aguarde um momento enquanto configuramos a conexão com Gemini API.</p>
          {!import.meta.env.VITE_GEMINI_API_KEY && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded text-red-300 text-sm">
              ⚠️ <strong>Erro:</strong> VITE_GEMINI_API_KEY não está configurada em .env.local
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-gray-900/50 border border-gray-700 rounded-lg">
      {statusMessage && (
        <div className={`px-4 py-2 text-sm text-center border-b border-gray-700 ${
          statusMessage.includes('✅') ? 'bg-green-900/20 text-green-300' :
          statusMessage.includes('❌') ? 'bg-red-900/20 text-red-300' :
          'bg-blue-900/20 text-blue-300'
        }`}>
          {statusMessage}
        </div>
      )}
      <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-gray-300" /></div>}
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'model' ? 'bg-gray-800' : 'bg-blue-600'}`}>
              <p className="text-white whitespace-pre-wrap">{msg.content || '...'}</p>
            </div>
             {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-300" /></div>}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
              <BotIcon className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg">
              <span className="text-gray-400 text-sm">ProductBuddy está digitando</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-700 space-y-2">
        {recordingError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            ⚠️ {recordingError}
          </div>
        )}
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Digite sua mensagem ou use o microfone..."
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || isRecording}
          />
          <button type="button" onClick={toggleRecording} className={`p-2 rounded-full transition ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} disabled={isLoading}>
            {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
          </button>
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:bg-gray-500" disabled={isLoading || isRecording || !userInput.trim()}>
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
        <Button onClick={handleSummarize} fullWidth isLoading={isSummarizing} disabled={isLoading || isRecording || messages.length < 2}>
            Finalizar e Resumir Conteúdo do PRD
        </Button>
      </div>
    </div>
  );
};

export default Chat;
