import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function executeRealSwap() {
  console.log('🚀 EXÉCUTION DU SWAP RÉEL SUR BASE');
  console.log('===================================');
  console.log(`🪙 Token: ${CONFIG.TOKENS.CUSTOM_TOKEN}`);
  console.log(`💰 Objectif: 0.0001 ETH`);
  console.log(`📊 Quantité à vendre: ~503.757 tokens`);
  console.log(`🌐 Via: Uniswap V4 sur Base\n`);

  // Quantité exacte calculée lors du test
  const exactSellAmount = ethers.parseUnits('503.757', 18).toString();

  try {
    const swapManager = new SwapManager();

    console.log('📋 Dernière vérification avant swap...');
    
    // Vérification finale du prix
    const finalPrice = await swapManager.zeroXApi.getPrice({
      sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
      buyToken: CONFIG.TOKENS.ETH,
      sellAmount: exactSellAmount,
      taker: swapManager.wallet.address
    });

    console.log(`✅ Prix confirmé: ${ethers.formatEther(finalPrice.buyAmount)} ETH`);
    console.log(`⛽ Frais réseau: ${ethers.formatEther(finalPrice.totalNetworkFee)} ETH`);
    console.log(`📊 Gas: ${finalPrice.gas}`);

    // Vérifier les soldes avant
    const tokenBalanceBefore = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
    const ethBalanceBefore = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
    
    console.log('\n💼 Soldes AVANT le swap:');
    console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceBefore, 18)}`);
    console.log(`   ETH: ${ethers.formatEther(ethBalanceBefore)}`);

    console.log('\n🚀 Exécution du swap...');
    
    const swapResult = await swapManager.executeSwap({
      sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
      buyToken: CONFIG.TOKENS.ETH,
      sellAmount: exactSellAmount,
      slippagePercentage: '0.02' // 2% de slippage
    });

    if (swapResult.success) {
      console.log('\n🎉 SWAP RÉUSSI !');
      console.log(`📄 Hash de transaction: ${swapResult.transactionHash}`);
      console.log(`🏗️  Bloc: ${swapResult.blockNumber}`);
      console.log(`⛽ Gas utilisé: ${swapResult.gasUsed}`);
      
      // Vérifier les nouveaux soldes
      console.log('\n⏳ Vérification des nouveaux soldes...');
      const tokenBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
      const ethBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
      
      console.log('\n💼 Soldes APRÈS le swap:');
      console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceAfter, 18)}`);
      console.log(`   ETH: ${ethers.formatEther(ethBalanceAfter)}`);
      
      console.log('\n📈 Différences:');
      console.log(`   Tokens vendus: ${ethers.formatUnits((BigInt(tokenBalanceBefore) - BigInt(tokenBalanceAfter)).toString(), 18)}`);
      console.log(`   ETH reçu: ${ethers.formatEther((BigInt(ethBalanceAfter) - BigInt(ethBalanceBefore)).toString())}`);
      
      console.log('\n🔗 Voir sur Base Scan:');
      console.log(`https://basescan.org/tx/${swapResult.transactionHash}`);
      
    } else {
      console.log('\n❌ ÉCHEC DU SWAP:');
      console.log(`Erreur: ${swapResult.error}`);
    }

  } catch (error) {
    console.error('\n💥 ERREUR GÉNÉRALE:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Vérifiez que vous avez assez d\'ETH pour les frais de gas');
    }
  }
}

// Confirmation avant exécution
console.log('⚠️  ATTENTION: Ce script va exécuter un swap réel sur Base !');
console.log('✅ Vos tokens seront échangés contre de l\'ETH');
console.log('💸 Des frais de gas seront prélevés');
console.log('\nPour continuer, lancez: node examples/execute-real-swap.js');

// SWAP ACTIVÉ - Le swap sera exécuté immédiatement
executeRealSwap().catch(console.error); 