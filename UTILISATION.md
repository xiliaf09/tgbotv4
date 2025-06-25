# 🚀 Guide d'utilisation - 0x Swap API

## 📋 Résumé

Ce projet vous permet d'effectuer des swaps de tokens sur Ethereum en utilisant l'API 0x. Il implémente toutes les étapes nécessaires selon la [documentation officielle](https://0x.org/docs/0x-swap-api/guides/swap-tokens-with-0x-swap-api).

## ✅ Configuration actuelle

Votre projet est **déjà configuré** avec :
- ✅ Clé API 0x : `dcc026ae-508f-4697-968a-0484c26e0263`
- ✅ Clé privée : Configurée
- ✅ Adresse wallet : `0x9Eb22742Ba782F9e4731348b05322f699ef5465D`
- ✅ Dépendances installées

## 🔍 Vérifier les prix (SANS swap)

Pour simplement vérifier les prix actuels :

```bash
node examples/price-check.js
```

Cela vous montrera :
- Prix ETH → USDC, USDT, DAI
- Frais de réseau estimés
- Routes de trading utilisées
- Gas estimé

## 💱 Effectuer un swap réel

⚠️ **ATTENTION** : Ceci effectuera une transaction réelle sur Ethereum mainnet !

### Étapes :

1. **Assurez-vous d'avoir des ETH** dans votre wallet `0x9Eb22742Ba782F9e4731348b05322f699ef5465D`

2. **Ajoutez une URL RPC** dans votre fichier `.env` :
   ```bash
   # Obtenez une clé gratuite sur infura.io ou alchemy.com
   RPC_URL=https://mainnet.infura.io/v3/VOTRE_CLE_INFURA
   ```

3. **Lancez l'exemple de swap** :
   ```bash
   node examples/swap-example.js
   ```

## 📁 Structure du projet

```
├── src/
│   ├── config.js         # Configuration centralisée
│   ├── zeroXApi.js       # Client API 0x
│   ├── swapManager.js    # Gestionnaire de swaps complet
│   └── index.js          # Exports principaux
├── examples/
│   ├── price-check.js    # Vérification des prix seulement
│   └── swap-example.js   # Exemple de swap complet
├── info.env              # Configuration avec vos clés
├── .env                  # Fichier de config actif
└── package.json          # Dépendances
```

## 🛠️ Utilisation avancée

### Importer dans votre propre code

```javascript
import { SwapManager, getSwapPrice } from './src/index.js';

// Vérifier un prix uniquement
const price = await getSwapPrice(
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
  '1000000000000000000', // 1 ETH en wei
  'VOTRE_ADRESSE_WALLET'
);

// Effectuer un swap complet
const swapManager = new SwapManager();
const result = await swapManager.executeSwap({
  sellToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  buyToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  sellAmount: '1000000000000000000',
  slippagePercentage: '0.01' // 1%
});
```

### Tokens supportés

Les adresses sont pré-configurées dans `src/config.js` :

```javascript
TOKENS: {
  ETH:  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  DAI:  '0x6b175474e89094c44da98b954eedeac495271d0f'
}
```

## 🔄 Processus de swap (selon documentation 0x)

Le `SwapManager` suit automatiquement toutes les étapes :

1. **Prix indicatif** : Récupération du prix avec `/swap/permit2/price`
2. **Allowance** : Configuration si nécessaire pour les tokens ERC20
3. **Cotation ferme** : Récupération avec `/swap/permit2/quote`
4. **Signature Permit2** : Signature EIP-712 du message
5. **Préparation** : Ajout de la signature aux données de transaction
6. **Exécution** : Envoi de la transaction sur la blockchain

## 📊 Exemple de résultat

```
🔍 Vérification: ETH → USDC
  💵 Prix: 1 ETH = 2338.59 USDC
  ⛽ Frais réseau: 0.00092 ETH
  📊 Gas estimé: 296034
  🛣️  Route: Uniswap_V3
```

## 🔒 Sécurité

- ✅ Clé privée stockée localement uniquement
- ✅ Pas de transmission de clé privée vers des serveurs
- ⚠️ Testez toujours avec de petits montants d'abord
- ⚠️ Vérifiez les frais de gas avant d'exécuter

## ❓ Dépannage

### Erreur "Insufficient balance"
- Vérifiez que votre wallet a assez d'ETH
- Les frais de gas sont décomptés du solde ETH

### Erreur "Allowance"
- Le script gère automatiquement les allowances
- Première transaction = allowance, deuxième = swap

### Erreur RPC
- Ajoutez une URL RPC valide dans `.env`
- Obtenez une clé gratuite sur Infura ou Alchemy

## 📞 Support

- [Documentation 0x officielle](https://0x.org/docs/0x-swap-api/guides/swap-tokens-with-0x-swap-api)
- [Dashboard 0x](https://dashboard.0x.org/apps) pour gérer votre clé API 