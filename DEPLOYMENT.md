# Guide de déploiement pour Plesk

## Variables d'environnement requises

Pour que l'application fonctionne correctement en production, vous devez configurer les variables d'environnement suivantes sur votre serveur Plesk :

### Variables obligatoires :

```bash
NODE_ENV=production
DISCORD_ID=votre_discord_client_id
DISCORD_SECRET=votre_discord_client_secret
AUTH_SECRET=votre_secret_d_authentification
AUTH_TRUST_HOST=true
AUTH_URL=https://solid.mo5.com
```

### Variables optionnelles :

```bash
VITE_AUTH_PATH=/api/auth
```

## Configuration Plesk

1. **Déployez les fichiers** : Transférez le contenu du dossier `.output/` vers votre répertoire web
2. **Configurez Node.js** : Assurez-vous que Node.js est activé dans votre hébergement Plesk
3. **Démarrez l'application** : Exécutez `node .output/server/index.mjs`
4. **Configurez les variables d'environnement** dans le panneau de contrôle Plesk

## Résolution des problèmes

### Erreur 404 sur /api/auth/csrf

Cette erreur indique que les variables d'environnement ne sont pas correctement configurées ou que l'application n'a pas les permissions nécessaires pour accéder aux routes API.

### Vérifications à effectuer :

1. Toutes les variables d'environnement sont-elles définies ?
2. L'application a-t-elle les permissions d'écriture nécessaires ?
3. Le serveur Node.js est-il correctement démarré ?

## Test local vs production

L'application fonctionne en local car les variables d'environnement sont probablement définies dans un fichier `.env` local. En production, ces variables doivent être configurées au niveau du serveur.
