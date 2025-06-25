import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function buyNewToken() {
  console.log('🛒 ACHAT D\'UN NOUVEAU TOKEN SUR BASE');
  console.log('====================================');
  
  const newTokenAddress = '0x0b96A1c6567c8d4186CfA18AD89C2b97f2854B07';
  const ethToSpend = '0.000001'; // 0.000001 ETH
  const sellAmountWei = ethers.parseEther(ethToSpend).toString();
  
  console.log(`🪙 Token à acheter: ${newTokenAddress}`);
  console.log(`💰 ETH à dépenser: ${ethToSpend} ETH`);
  console.log(`🌐 Chain: Base (${CONFIG.CHAIN_ID})`);
  console.log(`👛 Wallet: ${CONFIG.TAKER_ADDRESS}\n`);

  try {
    const swapManager = new SwapManager();

    // Vérifier le solde ETH actuel
    console.log('🔍 Vérification du solde ETH...');
    const ethBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
    const ethBalanceFormatted = parseFloat(ethers.formatEther(ethBalance));
    
    console.log(`💼 Solde ETH actuel: ${ethBalanceFormatted} ETH`);
    
    if (ethBalanceFormatted < parseFloat(ethToSpend)) {
      console.log(`❌ Solde ETH insuffisant!`);
      console.log(`   Requis: ${ethToSpend} ETH`);
      console.log(`   Disponible: ${ethBalanceFormatted} ETH`);
      return;
    }

    console.log('\n📊 Vérification du prix pour ce token...');
    
    try {
      // Test de prix : vendre ETH pour acheter le nouveau token
      const priceResponse = await swapManager.zeroXApi.getPrice({
        sellToken: CONFIG.TOKENS.ETH,      // Vendre ETH
        buyToken: newTokenAddress,         // Acheter le nouveau token
        sellAmount: sellAmountWei,         // Montant d'ETH à dépenser
        taker: swapManager.wallet.address
      });

      console.log('✅ Prix obtenu avec succès!');
      console.log(`📈 Pour ${ethToSpend} ETH, vous recevrez:`);
      console.log(`   ${priceResponse.buyAmount} unités du token`);
      
      // Essayer de formater avec différents nombres de décimales
      try {
        console.log(`   ~${ethers.formatUnits(priceResponse.buyAmount, 18)} tokens (si 18 décimales)`);
      } catch (e) {
        console.log(`   Format 18 décimales non disponible`);
      }
      
      try {
        console.log(`   ~${ethers.formatUnits(priceResponse.buyAmount, 6)} tokens (si 6 décimales)`);
      } catch (e) {
        console.log(`   Format 6 décimales non disponible`);
      }
      
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
          console.log('   - Allowance nécessaire (sera gérée automatiquement)');
        }
        
        if (priceResponse.issues.balance) {
          console.log(`   - Problème de solde détecté`);
        }
        
        if (priceResponse.issues.simulationIncomplete) {
          console.log('   - Simulation incomplète');
        }
      }

      // Demander confirmation puis exécuter l'achat
      console.log('\n🚀 Exécution de l\'achat...');
      
      const swapResult = await swapManager.executeSwap({
        sellToken: CONFIG.TOKENS.ETH,
        buyToken: newTokenAddress,
        sellAmount: sellAmountWei,
        slippagePercentage: '0.02' // 2% de slippage
      });

      if (swapResult.success) {
        console.log('\n🎉 ACHAT RÉUSSI !');
        console.log(`📄 Hash de transaction: ${swapResult.transactionHash}`);
        console.log(`🏗️  Bloc: ${swapResult.blockNumber}`);
        console.log(`⛽ Gas utilisé: ${swapResult.gasUsed}`);
        
        // Vérifier les nouveaux soldes
        console.log('\n⏳ Vérification des nouveaux soldes...');
        const newEthBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
        let newTokenBalance;
        
        try {
          newTokenBalance = await swapManager.getTokenBalance(newTokenAddress);
          console.log(`💼 Nouveau solde du token: ${newTokenBalance} unités`);
          
          // Essayer différents formats
          try {
            console.log(`   ~${ethers.formatUnits(newTokenBalance, 18)} tokens (18 décimales)`);
          } catch (e) {}
          
          try {
            console.log(`   ~${ethers.formatUnits(newTokenBalance, 6)} tokens (6 décimales)`);
          } catch (e) {}
          
        } catch (error) {
          console.log('⚠️  Impossible de récupérer le solde du nouveau token');
        }
        
        console.log(`💰 Nouveau solde ETH: ${ethers.formatEther(newEthBalance)} ETH`);
        
        console.log('\n📈 Résumé de l\'achat:');
        console.log(`   ETH dépensé: ${ethers.formatEther((BigInt(ethBalance) - BigInt(newEthBalance)).toString())} ETH`);
        console.log(`   Tokens reçus: ${priceResponse.buyAmount} unités`);
        
        console.log('\n🔗 Voir sur Base Scan:');
        console.log(`https://basescan.org/tx/${swapResult.transactionHash}`);
        
      } else {
        console.log('\n❌ ÉCHEC DE L\'ACHAT:');
        console.log(`Erreur: ${swapResult.error}`);
      }

    } catch (error) {
      if (error.message.includes('INSUFFICIENT_ASSET_LIQUIDITY')) {
        console.log('❌ Liquidité insuffisante pour ce token sur 0x');
        console.log('   Ce token pourrait ne pas être supporté ou avoir très peu de liquidité');
        console.log('💡 Suggestions:');
        console.log('   - Vérifiez l\'adresse du token');
        console.log('   - Essayez avec un montant plus important');
        console.log('   - Utilisez un autre DEX (Uniswap directement)');
      } else if (error.message.includes('VALIDATION_ERROR')) {
        console.log('❌ Erreur de validation - vérifiez l\'adresse du token');
      } else {
        console.error('❌ Erreur lors de la récupération du prix:', error.message);
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

console.log('🛒 Préparation de l\'achat du nouveau token...');
buyNewToken().catch(console.error); 