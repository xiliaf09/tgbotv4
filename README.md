# Bot Telegram 0x Swap API

Bot Telegram pour effectuer des swaps sur Uniswap via l'API 0x.org, optimisé pour le déploiement sur Railway.

## 🚀 Déploiement sur Railway

### 1. Prérequis

- Un compte Railway
- Une clé API 0x.org
- Un bot Telegram (créé via @BotFather)
- Une clé privée de wallet Ethereum
- Une adresse de wallet Ethereum

### 2. Variables d'environnement requises

Configurez ces variables dans votre projet Railway :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `ZEROX_API_KEY` | Votre clé API 0x.org | `dcc026ae-508f-4697-968a-0484c26e0263` |
| `TELEGRAM_BOT_TOKEN` | Token de votre bot Telegram | `7764242820:AAGWzwH0A3m6MVksET-8GpZUSBpzFd6OX5o` |
| `PRIVATE_KEY` | Clé privée de votre wallet (avec 0x) | `0x67e07bda21b5efd005be4af4f1acd37069f1932481e95d7bf0cbb32b9f0a0041` |
| `TAKER_ADDRESS` | Adresse de votre wallet | `0x9Eb22742Ba782F9e4731348b05322f699ef5465D` |
| `RPC_URL` | URL RPC Base (optionnel) | `https://mainnet.base.org` |

### 3. Déploiement

1. **Connectez votre repo GitHub à Railway**
   - Allez sur [Railway](https://railway.app)
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez ce repository

2. **Configurez les variables d'environnement**
   - Dans votre projet Railway, allez dans l'onglet "Variables"
   - Ajoutez chaque variable requise

3. **Déployez**
   - Railway détectera automatiquement le `package.json`
   - Le bot se lancera avec `npm start`

### 4. Vérification

- Vérifiez les logs dans Railway pour confirmer le démarrage
- Testez votre bot sur Telegram avec `/start`

## 🔧 Développement local

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement (avec fichier .env)
npm run local

# Démarrer avec variables d'environnement système
npm run dev
```

## 📱 Utilisation du bot

### Commandes principales
- `/start` - Démarrer le bot
- `/help` - Aide détaillée
- `/balance` - Voir vos soldes

### Trading
- Collez une adresse de token pour voir les informations
- Utilisez les boutons pour acheter rapidement
- Montants prédéfinis : 0.1, 0.2, 0.5 ETH
- Option pour montant personnalisé

## 🔒 Sécurité

- ⚠️ **Ne partagez jamais votre clé privée**
- ⚠️ **Testez d'abord avec de petits montants**
- ⚠️ **Vérifiez toujours les informations du token avant d'acheter**

## 🛠️ Structure du projet

```
src/
├── startBot.js          # Point d'entrée principal pour Railway
├── telegramBot.js       # Logique du bot Telegram
├── swapManager.js       # Gestion des swaps
├── zeroXApi.js          # API 0x
└── config.js            # Configuration
```

## 📝 Notes

- Le bot fonctionne sur Base mainnet (Chain ID: 8453)
- Utilise Uniswap V3 pour les swaps
- Supporte les tokens ERC-20 standard
- Gestion automatique des erreurs et redémarrage

## 🆘 Support

En cas de problème :
1. Vérifiez les logs dans Railway
2. Assurez-vous que toutes les variables d'environnement sont configurées
3. Vérifiez que votre bot Telegram est actif 