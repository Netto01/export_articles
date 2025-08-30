#!/bin/bash

# Script de inicialização para Export Articles
echo "🚀 Iniciando Export Articles..."

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências se necessário
if [ ! -f "venv/pyvenv.cfg" ] || [ ! -d "venv/lib/python3.13/site-packages/flask" ]; then
    echo "📚 Instalando dependências..."
    pip install -r requirements.txt
fi

# Iniciar servidor
echo "🌐 Iniciando servidor web..."
echo "📝 Acesse: http://localhost:8080"
echo "🛑 Para parar, pressione Ctrl+C"
python app.py
