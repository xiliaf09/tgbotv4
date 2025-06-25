// Script rapide pour configurer votre bot Telegram
// Usage: node examples/configure-bot.js VOTRE_TOKEN_ICI

import fs from 'fs';
import path from 'path';

const token = process.argv[2];

if (!token) {
  console.log('❌ Usage: node examples/configure-bot.js VOTRE_TOKEN_ICI');
  console.log('\n📝 Exemple:');
  console.log('node examples/configure-bot.js 123456789:ABCdefGHIjklMNOpqrSTUvwXYz');
  process.exit(1);
}

// Lire le fichier actuel
const filePath = 'examples/telegram-bot-start.js';
let content = fs.readFileSync(filePath, 'utf8');

// Remplacer le token
content = content.replace(
  "const TELEGRAM_BOT_TOKEN = 'VOTRE_TOKEN_ICI';",
  `const TELEGRAM_BOT_TOKEN = '${token}';`
);

// Écrire le fichier mis à jour
fs.writeFileSync(filePath, content);

console.log('✅ Token configuré avec succès!');
console.log(`🤖 Token: ${token.substring(0, 10)}...`);
console.log('\n🚀 Lancez maintenant votre bot avec:');
console.log('node examples/telegram-bot-start.js'); 