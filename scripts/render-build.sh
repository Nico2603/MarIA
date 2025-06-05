#!/bin/bash

echo "🚀 Iniciando build para Render..."

# Verificar Node.js
echo "📋 Versión de Node.js: $(node --version)"
echo "📋 Versión de npm: $(npm --version)"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci --only=production=false

# Configurar Prisma para Render
echo "🗄️ Configurando Prisma..."
export PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x,rhel-openssl-3.0.x"

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar generación
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "❌ Error: Cliente de Prisma no generado correctamente"
    exit 1
fi

echo "✅ Cliente de Prisma generado correctamente"

# Build de Next.js
echo "🏗️ Construyendo aplicación Next.js..."
if npm run build; then
    echo "✅ Build completado exitosamente"
else
    echo "❌ Error: Build de Next.js falló"
    exit 1
fi

# Verificar que el build existe
if [ ! -d ".next" ]; then
    echo "❌ Error: Directorio .next no encontrado"
    exit 1
fi

echo "✅ Verificación de build completada" 