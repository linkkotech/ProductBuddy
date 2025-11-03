```markdown
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ProductBuddy AI - Gerador de PRD com IA 🚀

Uma aplicação React + Vite que gera PRDs (Product Requirements Documents) completos e automaticamente usando Google Gemini AI.

## 🎯 Funcionalidades

- ✅ **Chat Interativo** com ProductBuddy (assistente de IA)
- ✅ **Streaming de Respostas** em tempo real
- ✅ **Suporte a Áudio** (gravação de voz)
- ✅ **Geração Automática de PRD** em Markdown
- ✅ **Lista de Tarefas Técnicas** estruturadas em JSON
- ✅ **Exportação** para CSV e Markdown
- ✅ **Múltiplos Modelos Gemini** otimizados para diferentes tarefas

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+
- Conta Google (para API Key do Gemini)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar API Key (IMPORTANTE!)

**⚠️ ATENÇÃO: A chave deve ser uma API Key válida do Gemini (começando com `AIzaSy`)**

1. Vá para: https://aistudio.google.com/app/apikey
2. Clique em "Create API key"
3. Copie a chave completa (ex: `AIzaSyD_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
4. Edite o arquivo `.env.local`:

```bash
VITE_GEMINI_API_KEY=AIzaSyD_sua_chave_aqui
```

**⛔ NÃO use:**
```
gen-lang-client-0581939767  (Isso não é uma API Key válida!)
```

### 3. Rodar Localmente
```bash
npm run dev
```

Acesse: http://localhost:3000/

### 4. Build para Produção
```bash
npm run build
npm run preview
```

---

## 📊 Arquitetura

```
productbuddy-ai/
├── components/
│   ├── Chat.tsx              # Chat interativo com ProductBuddy
│   ├── Accordion.tsx         # Componente accordion para seções
│   ├── Button.tsx            # Botão reutilizável
│   ├── Card.tsx              # Card de seção
│   ├── Input.tsx             # Input de texto
│   ├── Textarea.tsx          # Textarea
│   ├── OutputView.tsx        # Visualização de PRD gerado
│   ├── ProgressBar.tsx       # Barra de progresso
│   └── icons.tsx             # Ícones SVG
├── services/
│   └── geminiService.ts      # Integração com Gemini API
├── utils/
│   └── audio.ts              # Processamento de áudio
├── App.tsx                   # Componente raiz
├── index.tsx                 # Entrada da aplicação
└── types.ts                  # Tipos TypeScript
```

---

## 🔧 Modelos Gemini Utilizados

1. **gemini-2.5-pro** - Geração de PRD e tarefas técnicas
2. **gemini-2.5-flash** - Chat interativo rápido
3. **gemini-2.5-flash-native-audio** - Transcrição de áudio em tempo real

---

## 🐛 Troubleshooting

### Erro: "API key not valid"

**Causa:** A chave fornecida não é uma API Key válida do Gemini

**Solução:** 
1. Vá para https://aistudio.google.com/app/apikey
2. Crie uma nova chave (formato: `AIzaSy...`)
3. Atualize `.env.local`
4. Reinicie o servidor

### Erro: "Chat não inicializa"

**Solução:**
1. Abra o Console (F12)
2. Procure por "Chat inicializado" 
3. Se não encontrar, verifique `.env.local`
4. Reinicie o servidor

---

## 🔒 Segurança

- ⚠️ **NÃO compartilhe sua API Key**
- ⚠️ **NÃO faça commit do `.env.local`**
- ⚠️ **NÃO exponha a chave em código público**

---

## 📝 Licença

MIT - Use livremente!

---

## 🤝 Contribuindo

Encontrou um bug? Tem uma sugestão? Abra uma issue! 🙌

```
