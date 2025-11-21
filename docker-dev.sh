#!/bin/bash

echo "🐳 Iniciando Flytics ML com Docker..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se docker compose está disponível
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose não está disponível."
    exit 1
fi

echo "📦 Construindo e iniciando containers..."
docker compose up --build

echo "✅ Aplicação rodando em:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   ML API:   http://localhost:5000"
