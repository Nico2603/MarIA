#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del proyecto para despliegue...\n');

// Verificar archivos críticos
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'prisma/schema.prisma',
  'src/lib/constants.ts',
  'src/app/api/health/route.js',
  '.env.example'
];

let hasErrors = false;

console.log('📁 Verificando archivos críticos...');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTA`);
    hasErrors = true;
  }
});

// Verificar estructura de directorios
const criticalDirs = [
  'src/components',
  'src/app/api',
  'src/lib',
  'prisma/migrations'
];

console.log('\n📂 Verificando estructura de directorios...');
criticalDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - FALTA`);
    hasErrors = true;
  }
});

// Verificar package.json
console.log('\n📦 Verificando package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'start', 'postinstall', 'render-build'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`✅ Script: ${script}`);
    } else {
      console.log(`❌ Script: ${script} - FALTA`);
      hasErrors = true;
    }
  });
  
  const criticalDeps = [
    'next',
    'react',
    'react-dom',
    '@prisma/client',
    'prisma'
  ];
  
  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ Dependencia: ${dep}`);
    } else {
      console.log(`❌ Dependencia: ${dep} - FALTA`);
      hasErrors = true;
    }
  });
  
} catch (error) {
  console.log('❌ Error leyendo package.json:', error.message);
  hasErrors = true;
}

// Verificar prisma schema
console.log('\n🗄️ Verificando schema de Prisma...');
try {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  
  if (schema.includes('provider = "postgresql"')) {
    console.log('✅ Configurado para PostgreSQL');
  } else {
    console.log('❌ No configurado para PostgreSQL');
    hasErrors = true;
  }
  
  if (schema.includes('debian-openssl-3.0.x')) {
    console.log('✅ Targets binarios incluyen debian-openssl-3.0.x');
  } else {
    console.log('⚠️ Considera agregar debian-openssl-3.0.x a binaryTargets');
  }
  
} catch (error) {
  console.log('❌ Error leyendo schema.prisma:', error.message);
  hasErrors = true;
}

// Verificar next.config.js
console.log('\n⚙️ Verificando Next.js config...');
try {
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  
  if (nextConfig.includes('serverComponentsExternalPackages')) {
    console.log('✅ Configuración de Prisma para server components');
  } else {
    console.log('⚠️ Considera agregar serverComponentsExternalPackages para Prisma');
  }
  
} catch (error) {
  console.log('❌ Error leyendo next.config.js:', error.message);
  hasErrors = true;
}

// Resultado final
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICACIÓN FALLÓ - Corrige los errores antes del despliegue');
  process.exit(1);
} else {
  console.log('✅ VERIFICACIÓN EXITOSA - Proyecto listo para despliegue');
  process.exit(0);
} 