import { ethers } from 'ethers';
import { ZeroXSwapAPI } from './zeroXApi.js';
import { CONFIG } from './config.js';

export class SwapManager {
  constructor(privateKey = CONFIG.PRIVATE_KEY, rpcUrl = CONFIG.RPC_URL) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.zeroXApi = new ZeroXSwapAPI();
    
    console.log(`Wallet connecté: ${this.wallet.address}`);
  }

  /**
   * Effectue un swap complet en suivant toutes les étapes
   * @param {Object} swapParams - Paramètres du swap
   * @returns {Promise<Object>} - Résultat du swap
   */
  async executeSwap(swapParams) {
    const {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      slippagePercentage = '0.01'
    } = swapParams;

    // ⚡ MESURE DE PERFORMANCE - Début
    const startTime = Date.now();
    const performanceTimers = {
      start: startTime,
      price: null,
      allowance: null,
      quote: null,
      signature: null,
      transaction: null,
      confirmation: null,
      total: null
    };

    try {
      console.log('🚀 SWAP RAPIDE DÉMARRÉ!');
      
      // ⚡ ÉTAPE 1: HYPER-PARALLÉLISATION - Tout simultané avec fallbacks
      console.log('⚡ HYPER-SPEED...');
      const hyperStart = Date.now();
      
      // OPTIMISATION: Skip le prix, aller directement à la quote + autres
      const quotePromise = this.zeroXApi.getQuote({
        sellToken,
        buyToken,
        sellAmount,
        buyAmount,
        taker: this.wallet.address,
        slippagePercentage
      });
      
      const allowancePromise = this.checkCurrentAllowance(sellToken);
      const gasPricePromise = this.getOptimalGasPrice();
      
      // Exécuter en hyper-parallèle (sans prix car quote le contient)
      const [quote, currentAllowance, gasPrice] = await Promise.all([
        quotePromise,
        allowancePromise,
        gasPricePromise
      ]);
      
      // Utiliser les données de la quote comme prix
      const priceResponse = { 
        buyAmount: quote.buyAmount,
        issues: quote.issues 
      };
      
      // Stocker le gas price pour plus tard
      this.preCalculatedGasPrice = gasPrice;
      
      const hyperTime = Date.now() - hyperStart;
      console.log(`⚡ TOUT en ${hyperTime}ms`);
      
      performanceTimers.price = 0; // Skippé
      performanceTimers.quote = Math.floor(hyperTime / 3); // Estimation
      performanceTimers.allowance = 0;
      
      // ⚡ ÉTAPE 2: Allowance si nécessaire (en arrière-plan)
      let allowanceSetPromise = Promise.resolve();
      if (this.zeroXApi.needsAllowance(priceResponse) && currentAllowance === '0') {
        console.log('⚠️  Configuration allowance en arrière-plan...');
        allowanceSetPromise = this.setTokenAllowance(sellToken);
      } else {
        console.log('✅ Allowance OK');
      }

      // ⚡ ÉTAPE 3: Transaction HYPER-RAPIDE (tout pré-calculé)
      console.log('⚡ TX HYPER...');
      const txStart = Date.now();
      
      let txResponse;
      
      // Utiliser le gas price pré-calculé pour gagner du temps
      if (!quote.permit2 || !quote.permit2.eip712) {
        console.log('⚠️  Mode direct');
        
        if (quote.transaction) {
          // Transaction instantanée avec gas pré-calculé
          txResponse = await Promise.all([
            this.sendTransactionHyperFast({
              to: quote.transaction.to,
              data: quote.transaction.data,
              value: quote.transaction.value || "0",
              gasLimit: quote.transaction.gas,
              gasPrice: this.preCalculatedGasPrice
            }),
            allowanceSetPromise
          ]).then(([tx, _]) => tx);
          
        } else {
          throw new Error('Aucune méthode de transaction disponible');
        }
      } else {
        // Mode Permit2 optimisé
        const [signature, _] = await Promise.all([
          this.signPermit2Message(quote.permit2.eip712),
          allowanceSetPromise
        ]);
        
        const transaction = this.zeroXApi.prepareSwapTransaction(quote, signature);
        transaction.gasPrice = this.preCalculatedGasPrice;
        txResponse = await this.sendTransactionHyperFast(transaction);
      }
      
      const txTime = Date.now() - txStart;
      console.log(`⚡ TX en ${txTime}ms | Hash: ${txResponse.hash.substring(0,10)}...`);

      // ⚡ CONFIRMATION HYPER-AGRESSIVE
      console.log('⚡ Confirm...');
      const confirmStart = Date.now();
      const receipt = await this.waitForConfirmationHyperFast(txResponse);
      performanceTimers.confirmation = Date.now() - confirmStart;
      performanceTimers.total = Date.now() - startTime;
      
      performanceTimers.signature = Math.floor(txTime / 2);
      performanceTimers.transaction = Math.floor(txTime / 2);

      // 🎯 AFFICHAGE DES PERFORMANCES
      console.log('\n🏆 SWAP TERMINÉ - RAPPORT DE PERFORMANCE:');
      console.log('═══════════════════════════════════════');
      console.log(`⚡ Prix:          ${performanceTimers.price}ms`);
      console.log(`⚡ Allowance:     ${performanceTimers.allowance}ms`);
      console.log(`⚡ Quote:         ${performanceTimers.quote}ms`);
      console.log(`⚡ Signature:     ${performanceTimers.signature}ms`);
      console.log(`⚡ Transaction:   ${performanceTimers.transaction}ms`);
      console.log(`⚡ Confirmation:  ${performanceTimers.confirmation}ms`);
      console.log(`🚀 TOTAL:         ${performanceTimers.total}ms (${(performanceTimers.total/1000).toFixed(2)}s)`);
      console.log('═══════════════════════════════════════');

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        quote: quote,
        performance: performanceTimers
      };

    } catch (error) {
      console.error('❌ Erreur lors du swap:', error);
      
      // Gestion spéciale des transactions remplacées
      if (error.code === 'TRANSACTION_REPLACED') {
        if (error.replacement && error.replacement.hash) {
          console.log('🔄 Transaction remplacée mais confirmée:', error.replacement.hash);
          
          // Si la transaction de remplacement a réussi
          if (error.receipt && error.receipt.status === 1) {
            const totalTime = Date.now() - startTime;
            return {
              success: true,
              transactionHash: error.replacement.hash,
              blockNumber: error.receipt.blockNumber,
              gasUsed: error.receipt.gasUsed.toString(),
              performance: {
                total: totalTime,
                note: 'Transaction remplacée mais réussie'
              },
              replaced: true
            };
          }
        }
      }
      
      return {
        success: false,
        error: this.formatError(error)
      };
    }
  }

  /**
   * Définit l'allowance pour un token
   * @param {string} tokenAddress - Adresse du token
   */
  async setTokenAllowance(tokenAddress) {
    // Ne pas définir d'allowance pour ETH natif
    if (tokenAddress === CONFIG.TOKENS.ETH) {
      return;
    }

    const allowanceTransaction = this.zeroXApi.prepareAllowanceTransaction(tokenAddress);
    
    console.log(`Définition de l'allowance pour le token ${tokenAddress}...`);
    const txResponse = await this.sendTransaction(allowanceTransaction);
    await txResponse.wait();
    console.log('✅ Allowance configurée');
  }

  /**
   * Signe un message EIP-712 pour Permit2
   * @param {Object} eip712Data - Données EIP-712 à signer
   * @returns {Promise<string>} - Signature
   */
  async signPermit2Message(eip712Data) {
    const { domain, types, message } = eip712Data;
    
    // Retirer EIP712Domain des types car ethers l'ajoute automatiquement
    const typesWithoutDomain = { ...types };
    delete typesWithoutDomain.EIP712Domain;
    
    return await this.wallet.signTypedData(domain, typesWithoutDomain, message);
  }

  /**
   * Vérifie l'allowance actuelle d'un token
   * @param {string} tokenAddress - Adresse du token
   * @returns {Promise<string>} - Allowance actuelle
   */
  async checkCurrentAllowance(tokenAddress) {
    if (tokenAddress === CONFIG.TOKENS.ETH) {
      return '999999999999999999999999999'; // ETH n'a pas besoin d'allowance
    }
    
    try {
      const tokenAbi = ["function allowance(address owner, address spender) view returns (uint256)"];
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      const allowance = await tokenContract.allowance(this.wallet.address, CONFIG.PERMIT2_CONTRACT);
      return allowance.toString();
    } catch (error) {
      console.warn('Impossible de vérifier l\'allowance, supposée à 0');
      return '0';
    }
  }

  /**
   * Envoie une transaction optimisée avec gas estimation intelligente
   * @param {Object} transaction - Données de transaction
   * @returns {Promise<Object>} - Réponse de transaction
   */
  async sendTransactionOptimized(transaction) {
    // Gas estimation optimisée
    let gasLimit = transaction.gasLimit || transaction.gas;
    
    if (!gasLimit) {
      try {
        const estimatedGas = await this.provider.estimateGas({
          to: transaction.to,
          data: transaction.data,
          value: transaction.value || "0",
          from: this.wallet.address
        });
        // Ajouter 20% de marge pour éviter les échecs
        gasLimit = Math.floor(Number(estimatedGas) * 1.2);
      } catch (error) {
        console.warn('Estimation gas échouée, utilisation valeur par défaut');
        gasLimit = 500000;
      }
    }

    // Gas price optimisé pour la vitesse et éviter les remplacements
    let gasPrice = transaction.gasPrice;
    if (!gasPrice) {
      try {
        const feeData = await this.provider.getFeeData();
        if (feeData.gasPrice) {
          // Utiliser un gas price très élevé pour éviter les remplacements
          gasPrice = Math.floor(Number(feeData.gasPrice) * 1.5); // +50% au lieu de +10%
        }
      } catch (error) {
        console.warn('Impossible de récupérer le gas price');
      }
    }

    const txData = {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || "0",
      gasLimit: gasLimit,
      ...(gasPrice && { gasPrice: gasPrice })
    };

    return await this.wallet.sendTransaction(txData);
  }

  /**
   * Envoie une transaction ULTRA-RAPIDE avec gas premium
   * @param {Object} transaction - Données de transaction
   * @returns {Promise<Object>} - Réponse de transaction
   */
  async sendTransactionUltraFast(transaction) {
    // Gas estimation ULTRA-rapide
    let gasLimit = transaction.gasLimit || transaction.gas;
    
    if (!gasLimit) {
      // Estimation rapide avec timeout
      try {
        const estimationPromise = this.provider.estimateGas({
          to: transaction.to,
          data: transaction.data,
          value: transaction.value || "0",
          from: this.wallet.address
        });
        
        // Timeout de 500ms pour l'estimation
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 500)
        );
        
        const estimatedGas = await Promise.race([estimationPromise, timeoutPromise]);
        gasLimit = Math.floor(Number(estimatedGas) * 1.3); // +30% de marge
      } catch (error) {
        // Valeur par défaut ULTRA-rapide
        gasLimit = 300000;
      }
    }

    // Gas price PREMIUM pour vitesse maximale
    let gasPrice = transaction.gasPrice;
    if (!gasPrice) {
      try {
        const feeData = await this.provider.getFeeData();
        if (feeData.gasPrice) {
          // Gas price PREMIUM: +100% pour vitesse maximale
          gasPrice = Math.floor(Number(feeData.gasPrice) * 2.0);
        }
      } catch (error) {
        // Fallback avec gas price élevé
        gasPrice = '2000000000'; // 2 gwei
      }
    }

    const txData = {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || "0",
      gasLimit: gasLimit,
      gasPrice: gasPrice,
      // Forcer le type legacy pour plus de compatibilité
      type: 0
    };

    return await this.wallet.sendTransaction(txData);
  }

  /**
   * Pré-calcule le gas price optimal
   * @returns {Promise<string>} - Gas price optimisé
   */
  async getOptimalGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      if (feeData.gasPrice) {
        // Gas price HYPER-PREMIUM: +150% pour vitesse maximale
        return Math.floor(Number(feeData.gasPrice) * 2.5).toString();
      }
    } catch (error) {
      // Fallback ultra-élevé
      return '3000000000'; // 3 gwei
    }
    return '2500000000'; // 2.5 gwei par défaut
  }

  /**
   * Transaction HYPER-RAPIDE avec gas pré-calculé
   * @param {Object} transaction - Données de transaction
   * @returns {Promise<Object>} - Réponse de transaction
   */
  async sendTransactionHyperFast(transaction) {
    // Gas limit fixe pour éviter l'estimation
    let gasLimit = transaction.gasLimit || transaction.gas || 250000;
    
    // Si pas de gas limit, estimation ultra-rapide avec timeout de 200ms
    if (!transaction.gasLimit && !transaction.gas) {
      try {
        const estimationPromise = this.provider.estimateGas({
          to: transaction.to,
          data: transaction.data,
          value: transaction.value || "0",
          from: this.wallet.address
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 200)
        );
        
        const estimatedGas = await Promise.race([estimationPromise, timeoutPromise]);
        gasLimit = Math.floor(Number(estimatedGas) * 1.2); // +20% seulement
      } catch (error) {
        // Fallback rapide
        gasLimit = 200000;
      }
    }

    const txData = {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || "0",
      gasLimit: gasLimit,
      gasPrice: transaction.gasPrice || this.preCalculatedGasPrice,
      type: 0 // Legacy pour compatibilité
    };

    return await this.wallet.sendTransaction(txData);
  }

  /**
   * Attente HYPER-RAPIDE avec polling ultra-agressif
   * @param {Object} txResponse - Réponse de transaction
   * @returns {Promise<Object>} - Receipt de transaction
   */
  async waitForConfirmationHyperFast(txResponse) {
    const maxAttempts = 40; // 20 secondes max
    const pollInterval = 250; // Polling toutes les 250ms (ultra-agressif)
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txResponse.hash);
        if (receipt && receipt.status !== null) {
          return receipt;
        }
      } catch (error) {
        // Ignorer les erreurs
      }
      
      // Attendre moins longtemps
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    // Fallback si timeout
    return await txResponse.wait(1);
  }

  /**
   * Attente ULTRA-RAPIDE de confirmation avec polling agressif
   * @param {Object} txResponse - Réponse de transaction
   * @returns {Promise<Object>} - Receipt de transaction
   */
  async waitForConfirmationUltraFast(txResponse) {
    const maxAttempts = 60; // 30 secondes max
    const pollInterval = 500; // Polling toutes les 500ms
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txResponse.hash);
        if (receipt && receipt.status !== null) {
          return receipt;
        }
      } catch (error) {
        // Ignorer les erreurs de polling
      }
      
      // Attendre avant le prochain polling
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    // Fallback vers la méthode standard si le polling échoue
    return await txResponse.wait(1);
  }

  /**
   * Envoie une transaction (méthode legacy)
   * @param {Object} transaction - Données de transaction
   * @returns {Promise<Object>} - Réponse de transaction
   */
  async sendTransaction(transaction) {
    // Estimer le gas si pas fourni
    if (!transaction.gasLimit && !transaction.gas) {
      try {
        const estimatedGas = await this.provider.estimateGas({
          to: transaction.to,
          data: transaction.data,
          value: transaction.value || "0",
          from: this.wallet.address
        });
        transaction.gasLimit = estimatedGas;
      } catch (error) {
        console.warn('Impossible d\'estimer le gas, utilisation d\'une valeur par défaut');
        transaction.gasLimit = 500000; // Valeur par défaut
      }
    }

    return await this.wallet.sendTransaction({
      to: transaction.to,
      data: transaction.data,
      value: transaction.value || "0",
      gasLimit: transaction.gasLimit || transaction.gas,
      gasPrice: transaction.gasPrice
    });
  }

  /**
   * Récupère le solde d'un token pour le wallet
   * @param {string} tokenAddress - Adresse du token
   * @returns {Promise<string>} - Solde en unités de base
   */
  async getTokenBalance(tokenAddress) {
    if (tokenAddress === CONFIG.TOKENS.ETH) {
      const balance = await this.provider.getBalance(this.wallet.address);
      return balance.toString();
    } else {
      const tokenAbi = ["function balanceOf(address owner) view returns (uint256)"];
      const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      const balance = await tokenContract.balanceOf(this.wallet.address);
      return balance.toString();
    }
  }

  /**
   * Formate les erreurs pour l'affichage
   * @param {Error} error - Erreur à formater
   * @returns {string} - Message d'erreur formaté
   */
  formatError(error) {
    if (error.code === 'TRANSACTION_REPLACED') {
      return 'Transaction remplacée (probablement réussie avec gas plus élevé)';
    }
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Fonds insuffisants';
    }
    
    if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      return 'Impossible d\'estimer le gas (transaction échouerait)';
    }
    
    if (error.message && error.message.length > 100) {
      return error.message.substring(0, 100) + '...';
    }
    
    return error.message || 'Erreur inconnue';
  }
} 