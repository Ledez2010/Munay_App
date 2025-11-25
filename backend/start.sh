#!/bin/bash
# Script para iniciar el servidor backend
# Ejecutar desde la carpeta api/: bash start.sh

echo "🚀 Iniciando servidor Munay Backend..."
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json"
    echo "   Asegúrate de estar en la carpeta api/"
    exit 1
fi

# Verificar que .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encuentra .env"
    echo "   Creando desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✅ .env creado. Por favor edítalo con tus credenciales:"
        echo "   nano .env"
        exit 1
    else
        echo "   ❌ No se encuentra .env.example"
        exit 1
    fi
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production
fi

# Verificar que PM2 esté instalado
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 no está instalado. Instalando..."
    npm install -g pm2
fi

# Detener servidor anterior si existe
pm2 stop munay-api 2>/dev/null
pm2 delete munay-api 2>/dev/null

# Iniciar servidor
echo "🚀 Iniciando servidor con PM2..."
pm2 start src/server.js --name munay-api

# Guardar configuración
pm2 save

# Mostrar estado
echo ""
echo "✅ Servidor iniciado"
echo ""
pm2 status
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: pm2 logs munay-api"
echo "   Reiniciar: pm2 restart munay-api"
echo "   Detener: pm2 stop munay-api"
echo ""
echo "🔍 Verificar que funciona:"
echo "   curl http://localhost:3000/health"
echo ""

