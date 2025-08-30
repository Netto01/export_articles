# Export Articles - Ferramenta Acadêmica de Download

Uma ferramenta web moderna para fazer download automático de arquivos de páginas web, ideal para pesquisadores e acadêmicos que precisam coletar documentos de múltiplas fontes.

## 🚀 Características

- **Design Profissional**: Interface moderna com estética clean e minimalista
- **Tipografia Nativa**: Usa system fonts para melhor integração com o OS
- **Paleta de Cores Sutil**: Tons de cinza modernos e azuis profissionais  
- **Múltiplos Formatos**: Suporte para PDF, DOC, XLS, PPT, TXT, ZIP e imagens
- **Busca Recursiva**: Possibilidade de buscar arquivos em múltiplos níveis de profundidade
- **Download em Lote**: Download de múltiplos arquivos em um único arquivo ZIP
- **Filtros Personalizáveis**: Selecione exatamente os tipos de arquivo desejados
- **Segurança**: Limites de tamanho e validações de segurança

## 📋 Pré-requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

## � Início Rápido

Para iniciar rapidamente, você pode usar o script de inicialização:

```bash
./start.sh
```

Ou manualmente:

1. **Clone ou baixe o projeto**
   ```bash
   cd /Users/arlindo/Desktop/projetos/Export_articles
   ```

2. **Instale as dependências Python**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Inicie o servidor**
   ```bash
   python app.py
   ```

4. **Acesse a aplicação**
   Abra seu navegador e acesse: `http://localhost:8080`

📖 **Para exemplos práticos**, consulte o [Guia de Uso](EXAMPLE_USAGE.md)  
⚡ **Para referência rápida**, veja o [Quick Reference](QUICK_REFERENCE.md)

## 📖 Como Usar

### 1. Inserir URL
- Digite a URL da página que contém os arquivos desejados
- Exemplo: `https://example.com/documents`

### 2. Configurar Filtros
- Selecione os tipos de arquivo que deseja baixar:
  - **PDF**: Documentos PDF
  - **DOC/DOCX**: Documentos do Microsoft Word
  - **XLS/XLSX**: Planilhas do Excel
  - **PPT/PPTX**: Apresentações do PowerPoint
  - **TXT**: Arquivos de texto
  - **ZIP/RAR**: Arquivos compactados
  - **Imagens**: JPG, PNG, GIF, etc.

### 3. Definir Profundidade
- **Apenas página atual**: Busca só na página especificada
- **1 nível**: Inclui páginas linkadas
- **2 níveis**: Busca mais profundamente

### 4. Escanear e Baixar
1. Clique em **"Escanear"** para encontrar arquivos
2. Revise a lista de arquivos encontrados
3. Selecione os arquivos desejados
4. Clique em **"Download Selecionados"**

## 🛡️ Limitações de Segurança

- **Tamanho máximo por arquivo**: 100MB
- **Tamanho máximo total**: 500MB por download
- **Timeout de requisição**: 30 segundos
- **User-Agent**: Simula navegador real para melhor compatibilidade

## 🔍 Funcionalidades Técnicas

### Backend (Python/Flask)
- **Web Scraping**: BeautifulSoup para análise HTML
- **Requests**: Para downloads HTTP seguros
- **ZIP Creation**: Compactação automática dos arquivos
- **CORS**: Suporte para requisições cross-origin

### Frontend (HTML/CSS/JavaScript)
- **Design System**: Baseado em Tailwind-like design tokens
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Validação em Tempo Real**: Feedback imediato ao usuário
- **Progress Tracking**: Acompanhamento visual do progresso de download
- **Clean UI**: Design profissional com espaçamentos consistentes e tipografia nativa

## 📁 Estrutura do Projeto

```
Export_articles/
├── app.py              # Servidor Python Flask
├── index.html          # Interface principal
├── style.css           # Estilos CSS modernos
├── script.js           # Lógica JavaScript
├── requirements.txt    # Dependências Python
├── start.sh           # Script de inicialização
├── .gitignore         # Configuração Git
├── README.md          # Documentação principal
├── EXAMPLE_USAGE.md   # Guia de uso com exemplos
└── QUICK_REFERENCE.md # Referência rápida
```

## 🚨 Considerações Legais

- **Use Responsavelmente**: Respeite os termos de uso dos sites
- **Direitos Autorais**: Verifique permissões antes de baixar conteúdo
- **Rate Limiting**: A ferramenta inclui delays para não sobrecarregar servidores
- **Uso Acadêmico**: Ideal para pesquisa e fins educacionais

## 🛠️ Solução de Problemas

### Erro "Módulo não encontrado"
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Servidor não inicia
- Verifique se a porta 8080 está livre
- Execute como administrador se necessário
- Tente alterar a porta no arquivo `app.py`

### Sites não carregam
- Alguns sites podem bloquear bots
- Verifique conexão com internet
- Tente URLs diferentes

### Downloads falham
- Verifique se os arquivos são públicos
- Alguns sites requerem autenticação
- Verifique limites de tamanho

## 🔄 Atualizações Futuras

- [ ] Autenticação para sites protegidos
- [ ] Suporte a mais formatos de arquivo
- [ ] Interface para configurar User-Agent
- [ ] Histórico de downloads
- [ ] API REST completa

## 📞 Suporte

Para dúvidas ou problemas:
1. 📚 **Guia Detalhado**: Consulte o [EXAMPLE_USAGE.md](EXAMPLE_USAGE.md)
2. ⚡ **Referência Rápida**: Veja o [QUICK_REFERENCE.md](QUICK_REFERENCE.md)  
3. 🔍 **Logs do Sistema**: Verifique os logs no terminal
4. 🧪 **Teste Básico**: Experimente com URLs simples primeiro

## 📜 Licença

Este projeto é de código aberto para fins educacionais e acadêmicos.

---
**Export Articles** - Desenvolvido para facilitar a pesquisa acadêmica 🎓
# export_articles
