import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function executeThirdSwap() {
  console.log('🚀 TROISIÈME SWAP SUR BASE');
  console.log('===========================');
  console.log(`🪙 Token: ${CONFIG.TOKENS.CUSTOM_TOKEN}`);
  console.log(`💰 Objectif: 0.0001 ETH (troisième fois)`);
  console.log(`📊 Quantité à vendre: ~504.931 tokens`);
  console.log(`🌐 Via: Uniswap V4 sur Base\n`);

  // Quantité exacte calculée lors du test récent
  let exactSellAmount = ethers.parseUnits('504.931', 18).toString();

  try {
    const swapManager = new SwapManager();

    console.log('📋 Vérification avant le troisième swap...');
    
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
    
    console.log('\n💼 Soldes AVANT le troisième swap:');
    console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceBefore, 18)}`);
    console.log(`   ETH: ${ethers.formatEther(ethBalanceBefore)}`);

    // Vérifier qu'on a assez de tokens
    const tokensAvailable = parseFloat(ethers.formatUnits(tokenBalanceBefore, 18));
    const tokensNeeded = parseFloat(ethers.formatUnits(exactSellAmount, 18));
    
    if (tokensAvailable < tokensNeeded) {
      console.log(`⚠️  Attention: Vous n'avez que ${tokensAvailable} tokens mais il en faut ${tokensNeeded}`);
      console.log(`🔧 Ajustement: Utilisation de tous les tokens restants`);
      
      // Utiliser tous les tokens restants moins 1 pour éviter les erreurs d'arrondi
      const adjustedAmount = (BigInt(tokenBalanceBefore) * BigInt(99)) / BigInt(100); // 99% des tokens
      
      console.log(`📊 Nouveau montant: ${ethers.formatUnits(adjustedAmount.toString(), 18)} tokens`);
      
      // Recalculer le prix avec le montant ajusté
      const adjustedPrice = await swapManager.zeroXApi.getPrice({
        sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
        buyToken: CONFIG.TOKENS.ETH,
        sellAmount: adjustedAmount.toString(),
        taker: swapManager.wallet.address
      });
      
      console.log(`🎯 ETH que vous recevrez: ${ethers.formatEther(adjustedPrice.buyAmount)} ETH`);
      
      // Utiliser le montant ajusté pour le swap
      exactSellAmount = adjustedAmount.toString();
    }

    console.log('\n🚀 Exécution du troisième swap...');
    
    const swapResult = await swapManager.executeSwap({
      sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
      buyToken: CONFIG.TOKENS.ETH,
      sellAmount: exactSellAmount,
      slippagePercentage: '0.02' // 2% de slippage
    });

    if (swapResult.success) {
      console.log('\n🎉 TROISIÈME SWAP RÉUSSI !');
      console.log(`📄 Hash de transaction: ${swapResult.transactionHash}`);
      console.log(`🏗️  Bloc: ${swapResult.blockNumber}`);
      console.log(`⛽ Gas utilisé: ${swapResult.gasUsed}`);
      
      // Vérifier les nouveaux soldes
      console.log('\n⏳ Vérification des nouveaux soldes...');
      const tokenBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
      const ethBalanceAfter = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
      
      console.log('\n💼 Soldes APRÈS le troisième swap:');
      console.log(`   Tokens: ${ethers.formatUnits(tokenBalanceAfter, 18)}`);  
      console.log(`   ETH: ${ethers.formatEther(ethBalanceAfter)}`);
      
      console.log('\n📈 Différences (ce swap):');
      console.log(`   Tokens vendus: ${ethers.formatUnits((BigInt(tokenBalanceBefore) - BigInt(tokenBalanceAfter)).toString(), 18)}`);
      console.log(`   ETH reçu: ${ethers.formatEther((BigInt(ethBalanceAfter) - BigInt(ethBalanceBefore)).toString())}`);
      
      console.log('\n📊 BILAN TOTAL des trois swaps:');
      // Solde initial était ~1511.667 tokens
      const initialTokens = ethers.parseUnits('1511.667', 18);
      const totalTokensSold = BigInt(initialTokens) - BigInt(tokenBalanceAfter);
      const totalEthObtained = parseFloat(ethers.formatEther(ethBalanceAfter));
      
      console.log(`   🔥 Total tokens vendus: ${ethers.formatUnits(totalTokensSold.toString(), 18)}`);
      console.log(`   💰 ETH total obtenu: ${totalEthObtained.toFixed(8)} ETH`);
      console.log(`   📈 Tokens restants: ${ethers.formatUnits(tokenBalanceAfter, 18)}`);
      
      console.log('\n🔗 Voir sur Base Scan:');
      console.log(`https://basescan.org/tx/${swapResult.transactionHash}`);
      
      console.log('\n🎯 Résumé des 3 swaps:');
      console.log('   1er swap: ~503.757 tokens → ~0.0001 ETH');
      console.log('   2ème swap: ~504.344 tokens → ~0.0001 ETH');
      console.log(`   3ème swap: ~${ethers.formatUnits((BigInt(tokenBalanceBefore) - BigInt(tokenBalanceAfter)).toString(), 18)} tokens → ${ethers.formatEther((BigInt(ethBalanceAfter) - BigInt(ethBalanceBefore)).toString())} ETH`);
      
    } else {
      console.log('\n❌ ÉCHEC DU TROISIÈME SWAP:');
      console.log(`Erreur: ${swapResult.error}`);
    }

  } catch (error) {
    console.error('\n💥 ERREUR:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Vérifiez que vous avez assez d\'ETH pour les frais de gas');
    }
  }
}

console.log('🔄 Exécution du troisième swap avec le même token...');
executeThirdSwap().catch(console.error); 