import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function executeSecondSwap() {
  console.log('🚀 DEUXIÈME SWAP SUR BASE');
  console.log('==========================');
  console.log(`🪙 Token: ${CONFIG.TOKENS.CUSTOM_TOKEN}`);
  console.log(`💰 Objectif: 0.0001 ETH (deuxième fois)`);
  console.log(`📊 Quantité à vendre: ~504.344 tokens`);
  console.log(`🌐 Via: Uniswap V4 sur Base\n`);

  // Quantité exacte calculée lors du test récent
  const exactSellAmount = ethers.parseUnits('504.344', 18).toString();

  try {
    const swapManager = new SwapManager();

    console.log('📋 Vérification avant le deuxième swap...');
    
    // Vérification du prix actuel
    const currentPrice = await swapManager.zeroXApi.getPrice({
      sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
      buyToken: CONFIG.TOKENS.ETH,
      sellAmount: exactSellAmount,
      taker: swapManager.wallet.address
    });

    console.log(`✅ Prix confirmé: ${ethers.formatEther(currentPrice.buyAmount)} ETH`);
    console.log(`⛽ Frais réseau: ${ethers.formatEther(currentPrice.totalNetworkFee)} ETH`);
    console.log(`📊 Gas: ${currentPrice.gas}`);

    // Vérifier les soldes actuels
    const tokenBalanceBefore = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
    const ethBalanceBefore = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
    
    console.log('\n💼 Soldes AVANT le deuxième swap:');
    console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceBefore, 18)}`);
    console.log(`   ETH: ${ethers.formatEther(ethBalanceBefore)}`);

    console.log('\n🚀 Exécution du deuxième swap...');
    
    const swapResult = await swapManager.executeSwap({
      sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
      buyToken: CONFIG.TOKENS.ETH,
      sellAmount: exactSellAmount,
      slippagePercentage: '0.02' // 2% de slippage
    });

    if (swapResult.success) {
      console.log('\n🎉 DEUXIÈME SWAP RÉUSSI !');
      console.log(`📄 Hash de transaction: ${swapResult.transactionHash}`);
      console.log(`🏗️  Bloc: ${swapResult.blockNumber}`);
      console.log(`⛽ Gas utilisé: ${swapResult.gasUsed}`);
      
      // Vérifier les nouveaux soldes
      console.log('\n⏳ Vérification des nouveaux soldes...');
      const tokenBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
      const ethBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
      
      console.log('\n💼 Soldes APRÈS le deuxième swap:');
      console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceAfter, 18)}`);  
      console.log(`   ETH: ${ethers.formatEther(ethBalanceAfter)}`);
      
      console.log('\n📈 Différences (ce swap):');
      console.log(`   Tokens vendus: ${ethers.formatUnits((BigInt(tokenBalanceBefore) - BigInt(tokenBalanceAfter)).toString(), 18)}`);
      console.log(`   ETH reçu: ${ethers.formatEther((BigInt(ethBalanceAfter) - BigInt(ethBalanceBefore)).toString())}`);
      
      console.log('\n📊 TOTAL des deux swaps:');
      // Solde initial était ~1511.667 tokens
      const initialTokens = ethers.parseUnits('1511.667', 18);
      const totalTokensSold = BigInt(initialTokens) - BigInt(tokenBalanceAfter);
      console.log(`   Total tokens vendus: ${ethers.formatUnits(totalTokensSold.toString(), 18)}`);
      console.log(`   ETH total obtenu: ~0.0002 ETH`);
      
      console.log('\n🔗 Voir sur Base Scan:');
      console.log(`https://basescan.org/tx/${swapResult.transactionHash}`);
      
    } else {
      console.log('\n❌ ÉCHEC DU DEUXIÈME SWAP:');
      console.log(`Erreur: ${swapResult.error}`);
    }

  } catch (error) {
    console.error('\n💥 ERREUR:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Vérifiez que vous avez assez d\'ETH pour les frais de gas');
    }
  }
}

console.log('🔄 Exécution du deuxième swap avec le même token...');
executeSecondSwap().catch(console.error); 