import { CONFIG } from './config.js';
import { ethers } from 'ethers';

export class ZeroXSwapAPI {
  constructor(apiKey = CONFIG.ZEROX_API_KEY) {
    this.apiKey = apiKey;
    this.baseUrl = CONFIG.ZEROX_API_BASE_URL;
    this.version = CONFIG.ZEROX_API_VERSION;
    this.headers = {
      '0x-api-key': this.apiKey,
      '0x-version': this.version,
      'Content-Type': 'application/json'
    };
    
    // Cache pour éviter les appels répétés
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 secondes
  }

  /**
   * Étape 1: Obtenir un prix indicatif ULTRA-RAPIDE
   * @param {Object} params - Paramètres du swap
   * @returns {Promise<Object>} - Réponse avec le prix
   */
  async getPrice(params) {
    const {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      taker,
      slippagePercentage = '0.01' // 1% par défaut
    } = params;

    // Clé de cache basée sur les paramètres
    const cacheKey = `price_${sellToken}_${buyToken}_${sellAmount || buyAmount}_${slippagePercentage}`;
    
    // Vérifier le cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const priceParams = new URLSearchParams({
      chainId: CONFIG.CHAIN_ID,
      sellToken,
      buyToken,
      taker,
      slippagePercentage,
      ...(sellAmount && { sellAmount }),
      ...(buyAmount && { buyAmount })
    });

    try {
      // Timeout optimisé pour vitesse/fiabilité
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

      const response = await fetch(
        `${this.baseUrl}/swap/permit2/price?${priceParams.toString()}`,
        { 
          headers: this.headers,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.reason || response.statusText}`);
      }

      const data = await response.json();
      
      // Mettre en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du prix:', error);
      throw error;
    }
  }

  /**
   * Étape 3: Obtenir une cotation ferme ULTRA-RAPIDE
   * @param {Object} params - Paramètres du swap
   * @returns {Promise<Object>} - Réponse avec la cotation complète
   */
  async getQuote(params) {
    const {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      taker,
      slippagePercentage = '0.01'
    } = params;

    const quoteParams = new URLSearchParams({
      chainId: CONFIG.CHAIN_ID,
      sellToken,
      buyToken,
      taker,
      slippagePercentage,
      ...(sellAmount && { sellAmount }),
      ...(buyAmount && { buyAmount })
    });

    try {
      // Timeout optimisé pour la quote
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s timeout

      const response = await fetch(
        `${this.baseUrl}/swap/permit2/quote?${quoteParams.toString()}`,
        { 
          headers: this.headers,
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.reason || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la cotation:', error);
      throw error;
    }
  }

  /**
   * Vérifie si une allowance est nécessaire pour un token
   * @param {Object} priceResponse - Réponse de l'API price
   * @returns {boolean} - true si une allowance est nécessaire
   */
  needsAllowance(priceResponse) {
    return priceResponse.issues?.allowance?.actual === "0";
  }

  /**
   * Prépare les données de transaction pour définir l'allowance
   * @param {string} tokenAddress - Adresse du token
   * @param {string} amount - Montant à approuver (en wei)
   * @returns {Object} - Données de transaction pour l'approbation
   */
  prepareAllowanceTransaction(tokenAddress, amount = ethers.MaxUint256.toString()) {
    // ABI pour la fonction approve d'un token ERC20
    const erc20Abi = [
      "function approve(address spender, uint256 amount) external returns (bool)"
    ];

    const tokenContract = new ethers.Interface(erc20Abi);
    const data = tokenContract.encodeFunctionData("approve", [
      CONFIG.PERMIT2_CONTRACT,
      amount
    ]);

    return {
      to: tokenAddress,
      data: data,
      value: "0"
    };
  }

  /**
   * Prépare la transaction finale avec signature Permit2
   * @param {Object} quote - Réponse de la cotation
   * @param {string} signature - Signature EIP-712
   * @returns {Object} - Transaction prête à être envoyée
   */
  prepareSwapTransaction(quote, signature) {
    // Calculer la longueur de la signature en hex (32 bytes)
    const signatureLength = ethers.zeroPadValue(
      ethers.toBeHex(ethers.getBytes(signature).length),
      32
    );

    // Concaténer les données de transaction avec la signature
    const transactionData = ethers.concat([
      quote.transaction.data,
      signatureLength,
      signature
    ]);

    return {
      to: quote.transaction.to,
      data: transactionData,
      value: quote.transaction.value || "0",
      gas: quote.transaction.gas,
      gasPrice: quote.transaction.gasPrice
    };
  }
} 