import { SwapManager } from './swapManager.js';
import { ZeroXSwapAPI } from './zeroXApi.js';
import { CONFIG } from './config.js';

// Exporter les classes principales
export { SwapManager, ZeroXSwapAPI, CONFIG };

// Fonction utilitaire pour créer un swap manager
export function createSwapManager(privateKey, rpcUrl) {
  return new SwapManager(privateKey, rpcUrl);
}

// Fonction utilitaire pour obtenir uniquement des prix
export async function getSwapPrice(sellToken, buyToken, sellAmount, takerAddress) {
  const api = new ZeroXSwapAPI();
  return await api.getPrice({
    sellToken,
    buyToken,
    sellAmount,
    taker: takerAddress
  });
}

// Si ce fichier est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 0x Swap API - Prêt à l\'utilisation!');
  console.log('📚 Consultez les exemples dans le dossier examples/');
  console.log('⚙️  Configurez vos variables d\'environnement dans .env');
} 