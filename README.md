# 🏛️ MO5 - Espace Membre d'Association

Application de gestion complète pour l'association MO5, construite avec SolidJS et une architecture DDD pragmatique. Ce système permet de gérer les membres, les événements, la billeterie, les cotisations et tous les aspects organisationnels de l'association.

## 🎯 Vision du Projet

MO5 est un **espace membre complet** avec plusieurs niveaux d'accès et de nombreuses fonctionnalités :

### 🏗️ **Niveaux d'accès :**

- **Public** : Billeterie pour les expositions
- **Membres** : Inscription aux événements (système Doodle-like)
- **Bureau** : Gestion administrative complète
- **Pôles** : Outils spécialisés (Live/Vidéo, etc.)

### 🔧 **Fonctionnalités principales :**

- **Billeterie publique** pour les expositions
- **Gestion d'événements** (organisation + inscriptions membres)
- **Outils pôle Live/Vidéo** (scripts, planning)
- **Gestion des cotisations**
- **Gestion de la collection**
- **Authentification Discord** (intégration serveur asso)

## 🚀 Démarrage rapide

### Prérequis

- Node.js 22+
- Yarn
- MySQL
- Serveur Discord de l'association

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd mo5-solid

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp env.example .env
# Éditer .env avec vos valeurs

# Démarrer en développement
yarn dev
```

## 🏗️ Architecture

### Structure Features-Based

```
src/
├── features/                   # Features métier
│   ├── auth/                   # Authentification Discord
│   │   ├── auth.api.ts         # Routes API
│   │   ├── auth.feature        # Documentation feature
│   │   ├── auth.profile.tsx    # Profil utilisateur
│   │   ├── auth.signin.tsx     # Connexion
│   │   └── auth.signout.tsx    # Déconnexion
│   ├── events/                 # Gestion des événements
│   ├── ticketing/              # Billeterie publique
│   ├── members/                # Gestion des membres
│   ├── subscriptions/          # Gestion des cotisations
│   ├── collection/             # Gestion de la collection
│   └── live-video/             # Outils pôle Live/Vidéo
├── database/                   # Configuration Drizzle
├── ui/                         # Composants réutilisables
├── utils/                      # Utilitaires
└── types/                      # Types TypeScript globaux
```

### Principes DDD Pragmatique

- **Colocation** : Tests à côté du code
- **Isolation** : Features indépendantes
- **Namespaces** : Préfixes clairs (xxx.store.ts)
- **Scope** : Feature trop grosse = mal découpée
- **Shared** : Ce qui n'est pas dans features est partagé

## 🧪 Tests

```bash
# Lancer tous les tests
yarn test

# Tests en mode watch
yarn test --watch

# Tests avec interface UI
yarn test:ui

# Tests avec couverture
yarn test:coverage
```

## 🎨 Styling

Le projet utilise **Tailwind CSS v4** avec des couleurs personnalisées définies dans `src/app.css` :

```css
@theme {
  --color-bg: #f2f2f2;
  --color-primary: #4088cf;
  --color-secondary: #e84855;
  --color-discord: #5468ff;
  /* ... */
}
```

## 🔐 Authentification et Rôles Discord

L'authentification utilise **Auth.js** avec Discord comme provider :

- Configuration dans `src/features/auth/auth.api.ts`
- Variables d'environnement requises dans `.env`
- Hooks et composants dans `src/features/auth/`

### Rôles Discord

Le système utilise les rôles Discord pour gérer les permissions :

- **`@everyone`** : Accès public (billeterie)
- **`Membre`** : Accès espace membre (inscriptions événements)
- **`Bureau`** : Gestion administrative complète
- **`Pôle Live`** : Outils spécialisés Live/Vidéo
- **`Pôle Vidéo`** : Outils spécialisés Vidéo
- **`Admin`** : Accès complet au système

## 📊 Base de données

- **ORM** : Drizzle ORM
- **Base** : MySQL
- **Configuration** : `src/database/`
- **URL** : `DATABASE_URL` dans `.env`

## 🚀 Scripts disponibles

```bash
yarn dev          # Développement
yarn build        # Build de production
yarn start        # Serveur de production
yarn lint         # Linting
yarn test         # Tests
yarn test:ui      # Tests avec UI
yarn test:coverage # Tests avec couverture
yarn db:generate  # Générer migrations
yarn db:migrate   # Appliquer migrations
yarn db:push      # Push schema
yarn db:studio    # Interface Drizzle Studio
```

## 📁 Documentation

- `docs/` : Documentation technique
- `docs/features/` : Documentation des features
- `docs/architecture/` : Architecture et tech stack

## 🎯 Features à implémenter

### Phase 1 - Base

- ✅ **Auth** : Authentification Discord complète avec rôles
- 🔄 **Events** : Gestion des événements (création, modification, inscriptions)
- 🔄 **Members** : Gestion des membres et profils

### Phase 2 - Fonctionnalités publiques

- ⏳ **Ticketing** : Billeterie publique pour expositions
- ⏳ **Public Events** : Affichage public des événements

### Phase 3 - Gestion administrative

- ⏳ **Subscriptions** : Gestion des cotisations
- ⏳ **Collection** : Gestion de la collection
- ⏳ **Reports** : Tableaux de bord et rapports

### Phase 4 - Outils spécialisés

- ⏳ **Live Video Tools** : Scripts, planning pour pôle Live/Vidéo
- ⏳ **Advanced Features** : Fonctionnalités avancées selon besoins

## 🎯 Architecture du Système MO5

### 🏠 Page d'accueil publique

- **Billeterie** pour les expositions
- **Événements publics** à venir
- **Informations** sur l'association

### 👥 Espace membre

- **Tableau de bord** personnel
- **Inscription aux événements** (système Doodle-like)
- **Historique** des participations
- **Gestion du profil**

### 🏢 Interface administrative

- **Gestion des événements** (création, modification)
- **Gestion des membres** et rôles
- **Gestion des cotisations**
- **Rapports** et statistiques

### 🎬 Outils pôles spécialisés

- **Pôle Live/Vidéo** : Scripts, planning, ressources
- **Autres pôles** : Outils selon besoins spécifiques

## 🔒 Sécurité et Confidentialité

- **Authentification Discord** pour tous les accès
- **Rôles granulaires** selon les responsabilités
- **Chiffrement** des données sensibles
- **Traçabilité** des actions importantes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-feature`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle feature'`)
4. Push vers la branche (`git push origin feature/nouvelle-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**MO5** - Espace membre d'association moderne et complet 🏛️
