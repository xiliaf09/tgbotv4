import { ZeroXSwapAPI } from '../src/zeroXApi.js';
import { CONFIG } from '../src/config.js';
import { ethers } from 'ethers';

async function testBaseSupport() {
  console.log('🔵 Test du support de Base par l\'API 0x');
  console.log('==========================================');
  
  const api = new ZeroXSwapAPI();
  
  // Test 1: ETH vers USDC sur Base
  console.log('\n🧪 Test 1: ETH → USDC sur Base');
  try {
    const price = await api.getPrice({
      sellToken: CONFIG.TOKENS.ETH,
      buyToken: CONFIG.TOKENS.USDC,
      sellAmount: ethers.parseEther('0.001').toString(), // 0.001 ETH
      taker: CONFIG.TAKER_ADDRESS
    });
    
    console.log('✅ Base est supporté par 0x API!');
    console.log(`💵 Prix: 0.001 ETH = ${ethers.formatUnits(price.buyAmount, 6)} USDC`);
    console.log(`⛽ Frais: ${ethers.formatEther(price.totalNetworkFee)} ETH`);
    
  } catch (error) {
    console.log('❌ Base ne semble pas supporté:', error.message);
    
    // Teste sur Ethereum mainnet pour comparaison
    console.log('\n🧪 Test de fallback: Retour à Ethereum mainnet');
    
    // Temporairement changer vers Ethereum
    const originalChainId = CONFIG.CHAIN_ID;
    CONFIG.CHAIN_ID = '1';
    
    try {
      const ethPrice = await api.getPrice({
        sellToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        sellAmount: ethers.parseEther('0.001').toString(),
        taker: CONFIG.TAKER_ADDRESS
      });
      
      console.log('✅ Ethereum mainnet fonctionne');
      console.log(`💵 Prix ETH: 0.001 ETH = ${ethers.formatUnits(ethPrice.buyAmount, 6)} USDC`);
      
    } catch (ethError) {
      console.log('❌ Problème général avec l\'API:', ethError.message);
    }
    
    // Restaurer la configuration originale
    CONFIG.CHAIN_ID = originalChainId;
  }
  
  // Test 2: Vérifier les chaînes supportées
  console.log('\n📋 Chaînes potentiellement supportées par 0x:');
  console.log('   - Ethereum (1) ✅');
  console.log('   - Polygon (137) ✅');
  console.log('   - BSC (56) ✅');
  console.log('   - Arbitrum (42161) ✅');
  console.log('   - Optimism (10) ✅');
  console.log('   - Base (8453) ❓');
  
  console.log('\n💡 Suggestion: Si Base n\'est pas supporté,');
  console.log('   utilisez un bridge pour transférer vos tokens vers Ethereum');
}

testBaseSupport().catch(console.error); 