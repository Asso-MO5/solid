#!/usr/bin/env node

// Script de démarrage pour l'application SolidJS en production
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vérification des variables d'environnement requises
const requiredEnvVars = [
  'NODE_ENV',
  'DISCORD_ID',
  'DISCORD_SECRET',
  'AUTH_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes :');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nVeuillez configurer ces variables dans votre environnement Plesk.');
  process.exit(1);
}

console.log('✅ Toutes les variables d\'environnement sont configurées');
console.log('🚀 Démarrage de l\'application...');

// Démarrage du serveur
const serverPath = join(__dirname, '.output', 'server', 'index.mjs');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`📤 Serveur arrêté avec le code: ${code}`);
  process.exit(code);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('📤 Arrêt gracieux du serveur...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📤 Arrêt gracieux du serveur...');
  server.kill('SIGINT');
});
