import { getSwapPrice, CONFIG } from '../src/index.js';
import { ethers } from 'ethers';

/**
 * Exemple simple pour vérifier les prix de différentes paires de tokens
 */
async function checkPrices() {
  console.log('💰 Vérification des prix avec 0x API');
  console.log('=====================================\n');

  // Adresse wallet pour les calculs (utilisez la vôtre)
  const takerAddress = CONFIG.TAKER_ADDRESS || '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

  const pairs = [
    {
      name: 'ETH → USDC',
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: CONFIG.TOKENS.USDC,
      sellAmount: '1000000000000000000', // 1 ETH
      decimals: 6
    },
    {
      name: 'ETH → USDT', 
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: CONFIG.TOKENS.USDT,
      sellAmount: '1000000000000000000', // 1 ETH
      decimals: 6
    },
    {
      name: 'ETH → DAI',
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: CONFIG.TOKENS.DAI,
      sellAmount: '1000000000000000000', // 1 ETH
      decimals: 18
    }
  ];

  for (const pair of pairs) {
    try {
      console.log(`🔍 Vérification: ${pair.name}`);
      
      const price = await getSwapPrice(
        pair.sellToken,
        pair.buyToken, 
        pair.sellAmount,
        takerAddress
      );

      const buyAmount = ethers.formatUnits(price.buyAmount, pair.decimals);
      const networkFee = ethers.formatEther(price.totalNetworkFee);
      
      console.log(`  💵 Prix: 1 ETH = ${buyAmount} ${pair.name.split(' → ')[1]}`);
      console.log(`  ⛽ Frais réseau: ${networkFee} ETH`);
      console.log(`  📊 Gas estimé: ${price.gas}`);
      
      if (price.route?.fills?.length > 0) {
        console.log(`  🛣️  Route: ${price.route.fills.map(f => f.source).join(' → ')}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.error(`❌ Erreur pour ${pair.name}:`, error.message);
      console.log('');
    }
  }
}

// Vérifier la configuration
if (!CONFIG.ZEROX_API_KEY) {
  console.log('❌ Clé API 0x manquante!');
  console.log('   Configurez ZEROX_API_KEY dans votre fichier .env');
  process.exit(1);
}

checkPrices().catch(console.error); 