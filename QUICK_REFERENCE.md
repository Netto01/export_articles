# Guia Rápido - Export Articles

## Como usar

1. Inicie o servidor:
   ```bash
   ./start.sh
   ```
2. Acesse no navegador: http://localhost:8080
3. Preencha a URL, escolha filtros, clique em "Escanear" e depois em "Download Selecionados".

## Problemas comuns

- Servidor não inicia: feche outros programas na porta 8080
- Nenhum arquivo encontrado: teste com `http://example.com/`
- Download lento: reduza a profundidade
- Erro de dependências: rode `pip install -r requirements.txt`

## Limites

- Arquivo individual: até 100MB
- Download total: até 500MB
- Timeout: 30 segundos por arquivo

## Links úteis

- Interface: http://localhost:8080
- Documentação: README.md
- Exemplos: EXAMPLE_USAGE.md
