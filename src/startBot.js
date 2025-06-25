import { startTelegramBot } from './telegramBot.js';
import { CONFIG } from './config.js';

async function main() {
  console.log('🚀 Démarrage du Bot Telegram 0x sur Railway');
  console.log('============================================');
  
  // Vérifier la configuration
  const requiredEnvVars = [
    'ZEROX_API_KEY',
    'PRIVATE_KEY', 
    'TAKER_ADDRESS',
    'TELEGRAM_BOT_TOKEN'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables d\'environnement manquantes:');
    missingVars.forEach(varName => {
      console.error(`   • ${varName}`);
    });
    console.error('\n📝 Configurez ces variables dans Railway:');
    console.error('   - Allez dans votre projet Railway');
    console.error('   - Variables > Add Variable');
    console.error('   - Ajoutez chaque variable manquante');
    process.exit(1);
  }
  
  try {
    console.log('⚙️  Configuration:');
    console.log(`   • Clé API 0x: ${CONFIG.ZEROX_API_KEY.substring(0, 8)}...`);
    console.log(`   • Wallet: ${CONFIG.TAKER_ADDRESS}`);
    console.log(`   • Chain: Base (${CONFIG.CHAIN_ID})`);
    console.log(`   • Token Bot: ${CONFIG.TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    
    // Démarrer le bot
    const bot = startTelegramBot(CONFIG.TELEGRAM_BOT_TOKEN);
    
    console.log('\n✅ Bot Telegram démarré avec succès!');
    console.log('📱 Commandes disponibles:');
    console.log('   • /start - Démarrer le bot');
    console.log('   • /help - Aide');
    console.log('   • /balance - Voir les soldes');
    console.log('   • Collez une adresse de token pour voir les infos et acheter');
    
  } catch (error) {
    console.error('💥 Erreur lors du démarrage:', error.message);
    process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Erreur non gérée détectée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Exception non capturée:', error);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du bot Telegram...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Arrêt du bot Telegram...');
  process.exit(0);
});

main().catch(console.error); 