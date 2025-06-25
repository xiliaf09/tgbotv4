import { SwapManager } from '../src/swapManager.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function testCustomTokenSwap() {
  console.log('🔵 Test de swap du token personnalisé sur Base');
  console.log('==============================================');
  console.log(`🪙 Token: ${CONFIG.TOKENS.CUSTOM_TOKEN}`);
  console.log(`🌐 Chain: Base (${CONFIG.CHAIN_ID})`);
  console.log(`👛 Wallet: ${CONFIG.TAKER_ADDRESS}\n`);

  try {
    const swapManager = new SwapManager();

    // Vérifier le solde du token
    console.log('🔍 Vérification du solde...');
    const tokenBalance = await swapManager.getTokenBalance(CONFIG.TOKENS.CUSTOM_TOKEN);
    console.log(`💼 Vous avez: ${tokenBalance} unités du token`);

    // Essayons de vendre une petite quantité du token
    // Commençons par 1% du solde ou une quantité fixe
    const sellAmount = ethers.parseUnits('1000', 18).toString(); // 1000 tokens (en supposant 18 décimales)
    
    console.log(`\n📊 Test de prix pour vendre ${ethers.formatUnits(sellAmount, 18)} tokens...`);

    try {
      // Test 1: Vendre le token pour de l'ETH
      console.log('\n🧪 Test 1: Token → ETH');
      const priceToETH = await swapManager.zeroXApi.getPrice({
        sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
        buyToken: CONFIG.TOKENS.ETH,
        sellAmount: sellAmount,
        taker: swapManager.wallet.address
      });

      console.log('✅ Prix obtenu pour ETH!');
      console.log(`💰 Vous recevrez: ${ethers.formatEther(priceToETH.buyAmount)} ETH`);
      console.log(`⛽ Frais réseau: ${ethers.formatEther(priceToETH.totalNetworkFee)} ETH`);
      console.log(`📊 Gas estimé: ${priceToETH.gas}`);
      
      if (priceToETH.route) {
        console.log('🛣️  Route:');
        priceToETH.route.fills.forEach((fill, index) => {
          console.log(`    ${index + 1}. ${fill.source} (${fill.proportionBps/100}%)`);
        });
      }

      // Vérifier si on obtient au moins 0.0001 ETH avec cette quantité
      const ethReceived = parseFloat(ethers.formatEther(priceToETH.buyAmount));
      console.log(`\n🎯 Objectif: 0.0001 ETH`);
      console.log(`📈 Reçu avec ${ethers.formatUnits(sellAmount, 18)} tokens: ${ethReceived} ETH`);
      
      if (ethReceived >= 0.0001) {
        console.log('✅ Quantité suffisante pour atteindre l\'objectif!');
        
        // Calculer la quantité exacte nécessaire pour 0.0001 ETH
        const ratio = 0.0001 / ethReceived;
        const exactSellAmount = (BigInt(sellAmount) * BigInt(Math.floor(ratio * 1000000))) / BigInt(1000000);
        
        console.log(`🎯 Quantité exacte pour 0.0001 ETH: ${ethers.formatUnits(exactSellAmount.toString(), 18)} tokens`);
        
        // Test avec la quantité exacte
        try {
          const exactPrice = await swapManager.zeroXApi.getPrice({
            sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
            buyToken: CONFIG.TOKENS.ETH,
            sellAmount: exactSellAmount.toString(),
            taker: swapManager.wallet.address
          });
          
          console.log(`✅ Prix exact: ${ethers.formatEther(exactPrice.buyAmount)} ETH`);
          
          // Option pour exécuter le swap réel
          console.log('\n🔄 Pour exécuter ce swap, décommentez la section ci-dessous:');
          
          /*
          console.log('\n🚀 Exécution du swap...');
          const swapResult = await swapManager.executeSwap({
            sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
            buyToken: CONFIG.TOKENS.ETH,
            sellAmount: exactSellAmount.toString(),
            slippagePercentage: '0.02' // 2%
          });

          if (swapResult.success) {
            console.log('🎉 Swap réussi!');
            console.log(`📄 Hash: ${swapResult.transactionHash}`);
          }
          */
          
        } catch (error) {
          console.log('❌ Erreur avec la quantité exacte:', error.message);
        }
        
      } else {
        console.log('⚠️  Il faut plus de tokens pour atteindre 0.0001 ETH');
        const needed = Math.ceil((0.0001 / ethReceived) * parseFloat(ethers.formatUnits(sellAmount, 18)));
        console.log(`📊 Quantité estimée nécessaire: ${needed} tokens`);
      }

    } catch (error) {
      if (error.message.includes('INSUFFICIENT_ASSET_LIQUIDITY')) {
        console.log('❌ Ce token n\'a pas assez de liquidité sur 0x');
        console.log('💡 Suggestions:');
        console.log('   - Essayez sur un autre DEX (Uniswap direct)');
        console.log('   - Vérifiez si le token est listé sur CoinGecko/DEXTools');
        
        // Test avec USDC comme alternative
        console.log('\n🧪 Test alternatif: Token → USDC');
        try {
          const priceToUSDC = await swapManager.zeroXApi.getPrice({
            sellToken: CONFIG.TOKENS.CUSTOM_TOKEN,
            buyToken: CONFIG.TOKENS.USDC,
            sellAmount: sellAmount,
            taker: swapManager.wallet.address
          });
          
          console.log('✅ Swap vers USDC possible!');
          console.log(`💵 Vous recevrez: ${ethers.formatUnits(priceToUSDC.buyAmount, 6)} USDC`);
          
        } catch (usdcError) {
          console.log('❌ Swap vers USDC aussi non disponible');
        }
        
      } else {
        console.error('❌ Erreur:', error.message);
      }
    }

  } catch (error) {
    console.error('💥 Erreur générale:', error.message);
  }
}

testCustomTokenSwap().catch(console.error); 