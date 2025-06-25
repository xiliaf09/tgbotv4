import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function debugBuyToken() {
  console.log('🔍 DEBUG - Achat de token avec analyse détaillée');
  console.log('===============================================');
  
  const newTokenAddress = '0x0b96A1c6567c8d4186CfA18AD89C2b97f2854B07';
  const ethToSpend = '0.000001';
  const sellAmountWei = ethers.parseEther(ethToSpend).toString();
  
  try {
    const swapManager = new SwapManager();

    console.log('🔍 1. Vérification du solde ETH...');
    const ethBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
    console.log(`💼 Solde: ${ethers.formatEther(ethBalance)} ETH`);

    console.log('\n🔍 2. Test de prix...');
    const priceResponse = await swapManager.zeroXApi.getPrice({
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: newTokenAddress,
      sellAmount: sellAmountWei,
      taker: swapManager.wallet.address
    });

    console.log('✅ Prix obtenu');
    console.log(`📊 Tokens à recevoir: ${ethers.formatUnits(priceResponse.buyAmount, 18)}`);

    console.log('\n🔍 3. Test de cotation ferme...');
    const quoteResponse = await swapManager.zeroXApi.getQuote({
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: newTokenAddress,
      sellAmount: sellAmountWei,
      taker: swapManager.wallet.address
    });

    console.log('✅ Cotation obtenue');
    console.log('🔍 Analyse de la réponse:');
    
    // Analyser la structure de la réponse
    console.log(`- Transaction présente: ${!!quoteResponse.transaction}`);
    console.log(`- Permit2 présent: ${!!quoteResponse.permit2}`);
    
    if (quoteResponse.permit2) {
      console.log(`- EIP712 présent: ${!!quoteResponse.permit2.eip712}`);
      if (quoteResponse.permit2.eip712) {
        console.log(`- Domain présent: ${!!quoteResponse.permit2.eip712.domain}`);
        console.log(`- Types présent: ${!!quoteResponse.permit2.eip712.types}`);
        console.log(`- Message présent: ${!!quoteResponse.permit2.eip712.message}`);
      }
    } else {
      console.log('⚠️  Pas de données Permit2 - ce token peut nécessiter une approche différente');
      
      // Essayer avec l'ancienne API AllowanceHolder
      console.log('\n🔍 4. Test avec méthode alternative...');
      
      try {
        // Essayer de construire la transaction manuellement
        if (quoteResponse.transaction) {
          console.log('📋 Transaction disponible, tentative d\'exécution directe...');
          
          const tx = {
            to: quoteResponse.transaction.to,
            data: quoteResponse.transaction.data,
            value: quoteResponse.transaction.value || "0",
            gasLimit: quoteResponse.transaction.gas
          };
          
          console.log('📤 Envoi de la transaction...');
          const txResponse = await swapManager.sendTransaction(tx);
          const receipt = await txResponse.wait();
          
          console.log('\n🎉 ACHAT RÉUSSI (méthode alternative) !');
          console.log(`📄 Hash: ${receipt.hash}`);
          console.log(`🏗️  Bloc: ${receipt.blockNumber}`);
          console.log(`⛽ Gas utilisé: ${receipt.gasUsed}`);
          
          // Vérifier les nouveaux soldes
          const newEthBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.ETH);
          const newTokenBalance = await swapManager.getTokenBalance(newTokenAddress);
          
          console.log('\n💼 Nouveaux soldes:');
          console.log(`   ETH: ${ethers.formatEther(newEthBalance)} ETH`);
          console.log(`   Token: ${ethers.formatUnits(newTokenBalance, 18)} tokens`);
          
          console.log('\n🔗 Voir sur Base Scan:');
          console.log(`https://basescan.org/tx/${receipt.hash}`);
          
        } else {
          console.log('❌ Pas de données de transaction disponibles');
        }
        
      } catch (altError) {
        console.error('❌ Erreur avec méthode alternative:', altError.message);
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
    
    if (error.message.includes('INSUFFICIENT_ASSET_LIQUIDITY')) {
      console.log('\n💡 Ce token n\'a pas de liquidité suffisante sur 0x');
    }
  }
}

debugBuyToken().catch(console.error); 