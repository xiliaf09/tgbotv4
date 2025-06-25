import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function exempleSwapETHversUSDC() {
  console.log('🔄 Exemple: Swap 1 ETH vers USDC');
  console.log('=====================================');

  try {
    // Créer le gestionnaire de swap
    const swapManager = new SwapManager();

    // Paramètres du swap (identiques à votre requête curl)
    const swapParams = {
      sellToken: CONFIG.TOKENS.ETH,      // 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
      buyToken: CONFIG.TOKENS.USDC,     // 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
      sellAmount: '1000000000000000000', // 1 ETH en wei
      slippagePercentage: '0.01'         // 1% de slippage
    };

    console.log('📊 Paramètres du swap:');
    console.log(`  • Vendre: 1 ETH`);
    console.log(`  • Acheter: USDC`);
    console.log(`  • Slippage: 1%`);
    console.log(`  • Wallet: ${swapManager.wallet.address}`);

    // Vérifier le solde ETH avant le swap
    const ethBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
    console.log(`💰 Solde ETH actuel: ${ethers.formatEther(ethBalance)} ETH`);

    if (ethers.parseEther('1').gt(ethBalance)) {
      console.log('❌ Solde ETH insuffisant pour effectuer le swap');
      return;
    }

    // Exécuter le swap
    const result = await swapManager.executeSwap(swapParams);

    if (result.success) {
      console.log('🎉 Swap réussi!');
      console.log(`📄 Hash de transaction: ${result.transactionHash}`);
      console.log(`🏗️  Bloc: ${result.blockNumber}`);
      console.log(`⛽ Gas utilisé: ${result.gasUsed}`);
      
      // Vérifier les nouveaux soldes
      const newEthBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
      const usdcBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.USDC);
      
      console.log('\n💼 Nouveaux soldes:');
      console.log(`  • ETH: ${ethers.formatEther(newEthBalance)} ETH`);
      console.log(`  • USDC: ${ethers.formatUnits(usdcBalance, 6)} USDC`);
    } else {
      console.log('❌ Échec du swap:', result.error);
    }

  } catch (error) {
    console.error('💥 Erreur:', error.message);
  }
}

async function exempleObtenirPrix() {
  console.log('\n🔍 Exemple: Obtenir le prix sans effectuer de swap');
  console.log('===============================================');

  try {
    const swapManager = new SwapManager();
    
    const priceResponse = await swapManager.zeroXApi.getPrice({
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: CONFIG.TOKENS.USDC,
      sellAmount: '1000000000000000000', // 1 ETH
      taker: swapManager.wallet.address
    });

    console.log('📈 Informations de prix:');
    console.log(`  • 1 ETH = ${ethers.formatUnits(priceResponse.buyAmount, 6)} USDC`);
    console.log(`  • Gas estimé: ${priceResponse.gas}`);
    console.log(`  • Prix du gas: ${priceResponse.gasPrice} wei`);
    console.log(`  • Frais réseau: ${ethers.formatEther(priceResponse.totalNetworkFee)} ETH`);
    
    if (priceResponse.route) {
      console.log('🛣️  Route de trading:');
      priceResponse.route.fills.forEach((fill, index) => {
        const fromToken = priceResponse.route.tokens.find(t => t.address.toLowerCase() === fill.from.toLowerCase());
        const toToken = priceResponse.route.tokens.find(t => t.address.toLowerCase() === fill.to.toLowerCase());
        console.log(`    ${index + 1}. ${fromToken?.symbol || 'Unknown'} → ${toToken?.symbol || 'Unknown'} via ${fill.source} (${fill.proportionBps/100}%)`);
      });
    }

  } catch (error) {
    console.error('💥 Erreur lors de la récupération du prix:', error.message);
  }
}

// Exécuter les exemples
async function main() {
  console.log('🚀 Démarrage des exemples 0x Swap API\n');
  
  // Vérifier la configuration
  if (!CONFIG.ZEROX_API_KEY || !CONFIG.PRIVATE_KEY) {
    console.log('❌ Configuration manquante!');
    console.log('   Copiez .env.example vers .env et configurez vos clés');
    return;
  }

  // Exemple 1: Obtenir seulement le prix
  await exempleObtenirPrix();
  
  // Exemple 2: Effectuer un swap réel (décommentez si vous voulez l'exécuter)
  // await exempleSwapETHversUSDC();
}

main().catch(console.error); 