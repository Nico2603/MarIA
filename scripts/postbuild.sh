#!/bin/bash

# Script de post-build para asegurar que Prisma funcione en producción
echo "Ejecutando configuración post-build..."

# Verificar que el cliente de Prisma se haya generado
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "Generando cliente de Prisma..."
  npx prisma generate
else
  echo "Cliente de Prisma ya existe"
fi

echo "Post-build completado" 