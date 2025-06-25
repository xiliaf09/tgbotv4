// Script de test pour vérifier la configuration
import { CONFIG } from './config.js';

console.log('🔍 Test de configuration Railway');
console.log('================================');

const requiredVars = [
  'ZEROX_API_KEY',
  'TELEGRAM_BOT_TOKEN', 
  'PRIVATE_KEY',
  'TAKER_ADDRESS'
];

console.log('\n📋 Variables d\'environnement:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 8)}...` : 'MANQUANTE';
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('\n⚙️  Configuration chargée:');
console.log(`   • API Base URL: ${CONFIG.ZEROX_API_BASE_URL}`);
console.log(`   • Chain ID: ${CONFIG.CHAIN_ID}`);
console.log(`   • RPC URL: ${CONFIG.RPC_URL}`);
console.log(`   • Taker Address: ${CONFIG.TAKER_ADDRESS ? CONFIG.TAKER_ADDRESS.substring(0, 10) + '...' : 'MANQUANTE'}`);

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Variables manquantes:');
  missingVars.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  console.log('\n📝 Configurez ces variables dans Railway:');
  console.log('   - Allez dans votre projet Railway');
  console.log('   - Variables > Add Variable');
  process.exit(1);
} else {
  console.log('\n✅ Toutes les variables sont configurées!');
  console.log('🚀 Le bot devrait démarrer correctement.');
} 