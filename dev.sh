#!/bin/bash

echo "🚀 Iniciando Flytics ML..."

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências raiz..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

echo "✅ Todas as dependências instaladas!"
echo "🎯 Use os comandos:"
echo "   npm run dev:frontend  - Frontend (React)"
echo "   npm run dev:backend   - Backend (Node.js)" 
echo "   npm run dev:ml        - ML API (Python)"
