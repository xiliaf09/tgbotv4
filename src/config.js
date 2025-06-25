// Configuration pour Railway - utilise les variables d'environnement directement
export const CONFIG = {
  // API 0x
  ZEROX_API_KEY: process.env.ZEROX_API_KEY,
  ZEROX_API_BASE_URL: 'https://api.0x.org',
  ZEROX_API_VERSION: 'v2',
  
  // Telegram Bot
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  
  // Blockchain
  CHAIN_ID: '8453', // Base mainnet
  RPC_URL: process.env.RPC_URL || 'https://mainnet.base.org',
  
  // Wallet
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  TAKER_ADDRESS: process.env.TAKER_ADDRESS,
  
  // Contrats importants
  PERMIT2_CONTRACT: '0x000000000022d473030f116ddee9f6b43ac78ba3',
  
  // Tokens courants (Base mainnet)
  TOKENS: {
    ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    WETH: '0x4200000000000000000000000000000000000006',
    USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    // Token spécifique demandé
    CUSTOM_TOKEN: '0x5bA8d32579A4497c12D327289A103C3ad5b64eb1'
  }
}; 