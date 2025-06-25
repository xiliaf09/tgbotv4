# 🤖 Guide - Bot Telegram 0x

## 📋 Étapes pour créer votre bot

### 1. Créer un bot Telegram avec BotFather

1. **Ouvrez Telegram** et cherchez `@BotFather`
2. **Démarrez une conversation** avec `/start`
3. **Créez un nouveau bot** avec `/newbot`
4. **Choisissez un nom** pour votre bot (ex: "Mon Bot 0x")
5. **Choisissez un username** unique (ex: "mon_bot_0x_bot")
6. **Copiez le token** que BotFather vous donne (format: `123456789:ABCdefGHIjklMNOpqrSTUvwXYz`)

### 2. Configurer le bot dans votre code

Modifiez le fichier `examples/telegram-bot-start.js` :

```javascript
// Remplacez cette ligne
const TELEGRAM_BOT_TOKEN = 'VOTRE_TOKEN_ICI';

// Par votre token
const TELEGRAM_BOT_TOKEN = '123456789:ABCdefGHIjklMNOpqrSTUvwXYz';
```

### 3. (Optionnel) Sécuriser l'accès

Pour restreindre l'accès à certains utilisateurs :

1. **Trouvez votre ID Telegram** :
   - Envoyez un message à `@userinfobot`
   - Il vous donnera votre ID (ex: 987654321)

2. **Ajoutez votre ID** dans le code :

```javascript
const AUTHORIZED_USER_IDS = [
  987654321,  // Votre ID
  123456789   // ID d'un autre utilisateur autorisé
];
```

## 🚀 Démarrer le bot

```bash
node examples/telegram-bot-start.js
```

## 📱 Commandes disponibles

### `/start`
Démarre le bot et affiche le message de bienvenue

### `/help`
Affiche l'aide détaillée avec tous les exemples

### `/balance`
Affiche vos soldes ETH et USDC sur Base

### `/buy <token> <montant_eth>`
**Exemples :**
- `/buy 0x1234...abcd 0.001` - Achète le token avec 0.001 ETH
- `/buy USDC 0.1` - Achète de l'USDC avec 0.1 ETH

### `/sell <token> <montant_tokens>`
**Exemples :**
- `/sell 0x1234...abcd 1000` - Vend 1000 unités du token
- `/sell USDC 100` - Vend 100 USDC

### `/price <from> <to> <montant>`
**Exemples :**
- `/price ETH USDC 0.1` - Prix pour échanger 0.1 ETH contre USDC
- `/price 0x1234...abcd ETH 1000` - Prix pour vendre 1000 tokens

## 🔒 Sécurité

### Configuration recommandée pour un usage personnel :
```javascript
const AUTHORIZED_USER_IDS = [
  VOTRE_ID_TELEGRAM  // Seul vous pouvez utiliser le bot
];
```

### Configuration pour un groupe :
```javascript
const AUTHORIZED_USER_IDS = [
  123456789,  // User 1
  987654321,  // User 2
  555666777   // User 3
];
```

### Configuration publique (dangereux) :
```javascript
const AUTHORIZED_USER_IDS = [
  // Liste vide = accès pour tous
];
```

## ⚙️ Tokens pré-configurés

Le bot reconnaît ces raccourcis :
- `ETH` = Ethereum natif
- `USDC` = USD Coin sur Base
- `USDT` = Tether sur Base
- `DAI` = DAI sur Base
- `WETH` = Wrapped Ethereum sur Base

## 🛠️ Personnalisation avancée

### Ajouter de nouveaux tokens
Dans `src/config.js`, ajoutez :
```javascript
TOKENS: {
  // ... tokens existants
  VOTRE_TOKEN: '0xADRESSE_DU_TOKEN'
}
```

### Modifier le slippage
Dans `src/telegramBot.js`, ligne du slippage :
```javascript
slippagePercentage: '0.02' // 2% -> changez selon vos besoins
```

### Changer la chaîne
Dans `src/config.js` :
```javascript
CHAIN_ID: '8453', // Base -> changez pour Ethereum (1), Polygon (137), etc.
```

## 🔧 Dépannage

### "Accès non autorisé"
- Vérifiez que votre ID Telegram est dans `AUTHORIZED_USER_IDS`
- Ou laissez la liste vide pour un accès public

### "Bot non trouvé"
- Vérifiez que le token est correct
- Assurez-vous que le bot n'est pas arrêté

### "Erreur de transaction"
- Vérifiez votre solde ETH
- Le token existe-t-il sur Base ?
- Y a-t-il assez de liquidité ?

## 📊 Monitoring

Le bot affiche des logs en temps réel :
```
🤖 Bot Telegram 0x démarré!
👛 Wallet: 0x1234...
🌐 Chain: Base (8453)
✅ Bot Telegram démarré avec succès!
```

## 🛑 Arrêter le bot

Utilisez `Ctrl+C` dans le terminal pour arrêter proprement le bot.

---

**⚠️ Rappel important :** Toutes les transactions sont réelles et utilisent de vrais fonds ! Testez d'abord avec de petits montants. 