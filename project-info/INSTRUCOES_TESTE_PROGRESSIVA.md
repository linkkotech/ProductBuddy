# 🧪 INSTRUÇÕES DE TESTE - SUMARIZAÇÃO PROGRESSIVA

**Data:** 3 de Novembro de 2025  
**Versão:** 1.0  
**Duração Estimada:** 10-15 minutos (teste manual)

---

## 📋 PRÉ-REQUISITOS

- ✅ Node.js 16+ instalado
- ✅ npm packages instaladas (`npm install`)
- ✅ API Key Gemini válida em `.env.local`
- ✅ Servidor rodando em http://localhost:3000/
- ✅ Browser com console aberto (F12)

---

## 🎯 TESTE 1: Validar Extração Incremental de Uma Seção

### Passos

1. **Preencher Formulário**
   - Nome do Produto: `TaskFlow`
   - Objetivo Principal: `Criar um sistema de gerenciamento de tarefas em tempo real`
   - Equipe: `3 desenvolvedores, 1 designer`
   - Tech Stack: `React, TypeScript, Node.js`
   - Clicar "Próxima"

2. **Iniciar Chat**
   - Clicar "Próxima" novamente
   - Chat inicializa com ProductBuddy

3. **Observar Console**
   ```
   ✅ Chat inicializado com sucesso
   📍 Movendo para seção 1/10: visao_geral
   ```

4. **Conversa Sobre Visão Geral**
   - Você: "O TaskFlow é uma ferramenta para equipes gerenciarem projetos de forma colaborativa, com dashboard em tempo real, notificações e integração com calendários."
   - Bot: [Responde e valida]
   - Console: Nada ainda (seção não foi aprovada)

5. **Aprovar Seção**
   - Você: "Ótimo, está perfeito. Próxima seção."
   - **Console esperado:**
   ```
   🔍 Verificando se seção foi validada...
   ✅ Seção 'visao_geral' validada pelo usuário!
   📤 Extraindo seção: "Visão Geral"
   [aguarda resposta Gemini]
   📥 Seção "Visão Geral" extraída com sucesso (XXX caracteres)
   📊 prdSectionData atualizado: {
     visao_geral: "Ferramenta de gerenciamento de tarefas...",
     ...
   }
   🎯 Seções extraídas: ['visao_geral']
   📍 Movendo para seção 2/10: escopo
   ✅ Seção 'visao_geral' extraída com sucesso!
   ```

6. **Validar Estado**
   - `prdSectionData.visao_geral` ≠ vazio ✅
   - `currentSectionIndex` = 1 ✅
   - `extractedSections` = {'visao_geral'} ✅

---

## 🎯 TESTE 2: Simular Conversa de Múltiplas Seções (3-5 seções)

### Passos

1. **Repetir aprovação 3-5 vezes**
   - Para cada seção (Escopo, Personas, Requisitos Funcionais, Requisitos Não Funcionais):
   - Conversa normal → Usuário aprova → Extração automática

2. **Esperado:**
   - Console mostra progresso: `1/10 → 2/10 → 3/10 → 4/10 → 5/10`
   - `prdSectionData` preenche incrementalmente
   - `extractedSections` cresce: 1 → 2 → 3 → 4 → 5

3. **Sem erros de token limit** ✅

---

## 🎯 TESTE 3: Tentar Finalizar com Seções Incompletas

### Passos

1. **Após 2-3 seções extraídas**
   - Clicar no botão "Finalizar e Gerar PRD"

2. **Esperado:**
   ```
   ⚠️ 7 seção(ões) ainda não foram extraída(s). 
   Faltam: escopo, personas, requisitos_funcionais, ...
   ```

3. **Validar:**
   - Botão não deve processar (deve recusar) ✅
   - Mensagem de aviso clara ✅

---

## 🎯 TESTE 4: Fluxo Completo (Todas 10 Seções)

### Passos

**Nota:** Este teste é longo. Pode usar respostas genéricas.

1. **Ir para seção 1 (Visão Geral)**
   - Resposta: "Aplicação web para gerenciamento de projetos colaborativos"
   - Aprovar: "Ótimo"

2. **Seção 2 (Escopo)**
   - Resposta: "Incluir dashboard, tarefas, equipes, notificações"
   - Aprovar: "Próxima"

3. **Seção 3 (Personas)**
   - Resposta: "Project managers, desenvolvedores, stakeholders"
   - Aprovar: "Sim, válido"

4. **Seção 4 (Requisitos Funcionais)**
   - Resposta: "CRUD tarefas, atribuição, comentários, notificações em tempo real"
   - Aprovar: "Tudo certo"

5. **Seção 5 (Requisitos Não Funcionais)**
   - Resposta: "Performance < 2s, 99.9% uptime, suporta 1000 usuários simultâneos"
   - Aprovar: "OK"

6. **Seção 6 (Design UX)**
   - Resposta: "Interface limpa, dark mode, responsive, acessibilidade WCAG 2.1"
   - Aprovar: "Perfeito"

7. **Seção 7 (Fluxo de Usuário)**
   - Resposta: "Login → Dashboard → Criar projeto → Convidar equipe → Gerenciar tarefas"
   - Aprovar: "Está bom"

8. **Seção 8 (Métricas de Sucesso)**
   - Resposta: "Adoção: 500 usuários em 3 meses, retention: 80%, satisfaction: 4.5/5"
   - Aprovar: "Valido"

9. **Seção 9 (Dependências e Riscos)**
   - Resposta: "Risco: integração com APIs terceiras. Dependência: banco de dados escalonável"
   - Aprovar: "Faz sentido"

10. **Seção 10 (Questões em Aberto)**
    - Resposta: "Política de preços, timeline de MVP, estratégia de marketing"
    - Aprovar: "Finalizar"

### Esperado na Finalização

```
🚀 Iniciando geração final de documentos...
📋 Dados para geração final: {
  product_name: "TaskFlow",
  main_objective: "...",
  team: "...",
  prd_sections: {
    visao_geral: "Aplicação web para...",
    escopo: "Incluir dashboard, tarefas, equipes...",
    personas: "Project managers, desenvolvedores, stakeholders",
    ...
  }
}
✅ PRD e tarefas geradas com sucesso!
✅ Documentos finais: {
  prd_markdown: "# TaskFlow\n\n## Visão Geral\n...",
  tasks_json: [...]
}
```

---

## 🔍 O QUE VALIDAR

| Item | Esperado | ✅/❌ |
|------|----------|-------|
| Seções extraídas incrementalmente | 10 chamadas pequenas (não 1 massiva) | |
| Console mostra progresso 1/10 → 10/10 | Cada transição logada | |
| `prdSectionData` preenchido após cada validação | 10 campos preenchidos | |
| `extractedSections` cresce 1 → 10 | Set rastreando progresso | |
| Sem erros de token limit | Sucesso em todas as 10 extrações | |
| PRD gerado com qualidade | Conteúdo bem estruturado em Markdown | |
| Tarefas geradas corretamente | JSON válido com structure esperada | |
| Zero TypeScript errors | Build sucesso | |

---

## 📊 MÉTRICAS ESPERADAS

### Performance
- Tempo por extração: ~2-3 segundos (gemini-2.5-pro)
- Tempo por validação: ~0.5-1 segundo (gemini-2.5-flash)
- Tempo total 10 seções: ~30-40 segundos
- Geração final: ~3-5 segundos

### Confiabilidade
- Taxa de sucesso de validação: 95%+ (false positives mínimos)
- Taxa de sucesso de extração: 100% (ou falha claramente)
- Zero token limit excedido ✅

---

## 🐛 DEBUG - Se Algo Não Funcionar

### Se seção não é validada
```
Console: ⏳ Usuário ainda está preenchendo a seção...
Solução: Aprovar explicitamente ("ótimo", "próxima", "sim", etc)
```

### Se extração falha
```
Console: ❌ Falha ao extrair conteúdo de '...'
Status: ❌ Erro ao extrair seção
Solução: Verificar console, tentar novamente, aumentar token limit API
```

### Se geração final falha
```
Console: ❌ Erro na geração final
Solução: Verificar se todas 10 seções foram preenchidas
```

### Para ver estado completo
```javascript
// No console do browser:
console.log('prdSectionData:', prdSectionData)
console.log('extractedSections:', extractedSections)
console.log('currentSectionIndex:', currentSectionIndex)
```

---

## ✅ CHECKLIST FINAL

- [ ] Teste 1 passou (1 seção extraída)
- [ ] Teste 2 passou (3-5 seções extraídas)
- [ ] Teste 3 passou (rejeita incompleto)
- [ ] Teste 4 passou (todas 10 seções)
- [ ] PRD gerado com qualidade
- [ ] Tarefas geradas corretamente
- [ ] Zero erros no console
- [ ] Zero token limit excedido
- [ ] UI mostra progresso claro
- [ ] Logging detalhado funciona

---

## 🎉 SUCESSO

Se todos os testes passaram:

✅ **Sumarização Progressiva implementada com sucesso**  
✅ **Bug de token limit RESOLVIDO**  
✅ **Pronto para Fase 3 (Validações & UX)**  

👉 **Próximo passo:** Form field validation e UX refinements

---

**Duração do teste:** 10-15 minutos  
**Dificuldade:** Simples (apenas conversar e aprovar)  
**Resultado:** Dados claros sobre efetividade da implementação
