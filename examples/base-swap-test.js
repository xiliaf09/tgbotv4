import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function testSwapOnBase() {
  console.log('🔵 Test de swap sur Base');
  console.log('========================');
  console.log(`🪙 Token à vendre: ${CONFIG.TOKENS.CUSTOM_TOKEN}`);
  console.log(`💰 Pour acheter: 0.0001 ETH`);
  console.log(`🌐 Chain: Base (${CONFIG.CHAIN_ID})`);
  console.log(`👛 Wallet: ${CONFIG.TAKER_ADDRESS}\n`);

  try {
    // Créer le gestionnaire de swap
    const swapManager = new SwapManager();

    // Vérifier d'abord si nous avons des tokens à vendre
    console.log('🔍 Vérification du solde du token...');
    
    let tokenBalance;
    try {
      tokenBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
      console.log(`💼 Solde du token: ${tokenBalance} (unités de base)`);
    } catch (error) {
      console.log('⚠️  Impossible de vérifier le solde du token, continuons avec le test de prix...');
    }

    // Étape 1: Vérifier le prix pour acheter 0.0001 ETH
    console.log('\n📊 Vérification du prix...');
    
    const buyAmountWei = ethers.parseEther('0.0001').toString(); // 0.0001 ETH en wei
    
    try {
      const priceResponse = await swapManager.zeroXApi.getPrice({
        sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
        buyToken: CONFIG.TOKENS.ETH,
        buyAmount: buyAmountWei, // Nous spécifions combien nous voulons acheter
        taker: swapManager.wallet.address
      });

      console.log('✅ Prix obtenu avec succès!');
      console.log(`📈 Pour acheter 0.0001 ETH, vous devez vendre:`);
      console.log(`   ${priceResponse.sellAmount} unités du token`);
      console.log(`⛽ Frais réseau estimés: ${ethers.formatEther(priceResponse.totalNetworkFee)} ETH`);
      console.log(`📊 Gas estimé: ${priceResponse.gas}`);
      
      if (priceResponse.route) {
        console.log('🛣️  Route de trading:');
        priceResponse.route.fills.forEach((fill, index) => {
          console.log(`    ${index + 1}. ${fill.source} (${fill.proportionBps/100}%)`);
        });
      }

      // Vérifier les problèmes potentiels
      if (priceResponse.issues) {
        console.log('\n⚠️  Problèmes détectés:');
        
        if (priceResponse.issues.allowance?.actual === "0") {
          console.log('   - Allowance nécessaire pour ce token');
        }
        
        if (priceResponse.issues.balance) {
          console.log(`   - Solde insuffisant: ${priceResponse.issues.balance.actual} (requis: ${priceResponse.sellAmount})`);
        }
        
        if (priceResponse.issues.simulationIncomplete) {
          console.log('   - Simulation incomplète');
        }
      }

      // Demander confirmation pour le swap réel
      console.log('\n🔄 Voulez-vous effectuer ce swap réel? (Décommentez la section ci-dessous)');
      
      /*
      // DÉCOMMENTEZ CETTE SECTION POUR EFFECTUER LE SWAP RÉEL
      console.log('\n🚀 Exécution du swap...');
      
      const swapResult = await swapManager.executeSwap({
        sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
        buyToken: CONFIG.TOKENS.ETH,
        buyAmount: buyAmountWei,
        slippagePercentage: '0.02' // 2% de slippage
      });

      if (swapResult.success) {
        console.log('🎉 Swap réussi!');
        console.log(`📄 Hash: ${swapResult.transactionHash}`);
        console.log(`🏗️  Bloc: ${swapResult.blockNumber}`);
        console.log(`⛽ Gas utilisé: ${swapResult.gasUsed}`);
      } else {
        console.log('❌ Échec du swap:', swapResult.error);
      }
      */

    } catch (error) {
      if (error.message.includes('INSUFFICIENT_ASSET_LIQUIDITY')) {
        console.log('❌ Liquidité insuffisante pour ce token sur 0x');
        console.log('   Ce token pourrait ne pas être supporté ou avoir très peu de liquidité');
      } else if (error.message.includes('VALIDATION_ERROR')) {
        console.log('❌ Erreur de validation - vérifiez l\'adresse du token');
      } else {
        console.error('❌ Erreur:', error.message);
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

// Exécuter le test
testSwapOnBase().catch(console.error); 