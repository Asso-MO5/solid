# 👥 Feature: Gestion des Membres

## 📋 Description

Système de gestion des membres de l'association MO5, incluant les profils, rôles, cotisations et historique des participations.

## 🎯 Objectifs

- **Gestion des profils** membres avec informations Discord
- **Système de rôles** basé sur Discord
- **Gestion des cotisations** et statuts
- **Historique des participations** aux événements
- **Tableaux de bord** personnalisés par rôle

## 🏗️ Architecture DDD

### Domaines identifiés

1. **Member Management** : Gestion des profils et rôles
2. **Subscription Management** : Gestion des cotisations
3. **Activity Tracking** : Suivi des participations
4. **Role Management** : Gestion des permissions

### Entités principales

```typescript
interface Member {
  id: string
  discordId: string
  username: string
  displayName: string
  email?: string
  avatar?: string
  roles: string[] // Rôles Discord
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: Date
  lastActivityAt: Date
  profile: MemberProfile
}

interface MemberProfile {
  id: string
  memberId: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  bio?: string
  interests: string[]
  skills: string[]
  preferences: MemberPreferences
}

interface MemberPreferences {
  notifications: {
    email: boolean
    discord: boolean
    events: boolean
    newsletters: boolean
  }
  privacy: {
    showEmail: boolean
    showPhone: boolean
    showAddress: boolean
  }
}

interface Subscription {
  id: string
  memberId: string
  year: number
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  paidAt?: Date
  dueDate: Date
  paymentMethod?: string
  notes?: string
}

interface MemberActivity {
  id: string
  memberId: string
  type:
    | 'event_registration'
    | 'event_participation'
    | 'subscription_payment'
    | 'profile_update'
  description: string
  metadata: Record<string, any>
  createdAt: Date
}
```

## 🔐 Permissions et Rôles

### Rôles Discord mappés

```typescript
const DISCORD_ROLES = {
  '@everyone': {
    permissions: ['view_public_events', 'buy_tickets'],
    description: 'Accès public de base',
  },
  Membre: {
    permissions: ['view_member_events', 'register_events', 'view_profile'],
    description: "Membre de l'association",
  },
  Bureau: {
    permissions: [
      'manage_events',
      'manage_members',
      'view_analytics',
      'manage_subscriptions',
    ],
    description: 'Membre du bureau',
  },
  'Pôle Live': {
    permissions: ['manage_live_events', 'access_live_tools'],
    description: 'Membre du pôle Live',
  },
  'Pôle Vidéo': {
    permissions: ['manage_video_events', 'access_video_tools'],
    description: 'Membre du pôle Vidéo',
  },
  Admin: {
    permissions: ['*'], // Toutes les permissions
    description: 'Administrateur système',
  },
}
```

### Gestion des permissions

```typescript
class PermissionService {
  hasPermission(user: Member, resource: string, action: string): boolean {
    const userRoles = user.roles
    const requiredPermissions = this.getRequiredPermissions(resource, action)

    return userRoles.some((role) =>
      this.roleHasPermissions(role, requiredPermissions)
    )
  }

  private roleHasPermissions(role: string, permissions: string[]): boolean {
    const roleConfig = DISCORD_ROLES[role]
    if (!roleConfig) return false

    return permissions.every(
      (permission) =>
        roleConfig.permissions.includes(permission) ||
        roleConfig.permissions.includes('*')
    )
  }
}
```

## 📊 Base de données

### Tables

```sql
-- Membres
CREATE TABLE members (
  id VARCHAR(255) PRIMARY KEY,
  discord_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  avatar VARCHAR(500),
  roles JSON NOT NULL, -- Rôles Discord
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Profils membres
CREATE TABLE member_profiles (
  id VARCHAR(255) PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  bio TEXT,
  interests JSON, -- Array de strings
  skills JSON,    -- Array de strings
  preferences JSON, -- Objet MemberPreferences
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- Cotisations
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  due_date DATE NOT NULL,
  payment_method VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_year (member_id, year)
);

-- Activités membres
CREATE TABLE member_activities (
  id VARCHAR(255) PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL,
  type ENUM('event_registration', 'event_participation', 'subscription_payment', 'profile_update') NOT NULL,
  description VARCHAR(500) NOT NULL,
  metadata JSON, -- Données additionnelles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
```

## 🎨 Interface Utilisateur

### Pages principales

1. **`/profile`** : Profil personnel du membre
2. **`/profile/edit`** : Modification du profil
3. **`/members`** : Liste des membres (selon permissions)
4. **`/members/[id]`** : Profil d'un autre membre
5. **`/admin/members`** : Administration des membres
6. **`/subscriptions`** : Gestion des cotisations

### Composants

```typescript
// Composants principaux
<MemberProfile />        // Profil d'un membre
<MemberList />           // Liste des membres
<MemberCard />           // Carte d'un membre
<SubscriptionStatus />   // Statut des cotisations
<MemberActivity />       // Historique des activités
<MemberPermissions />    // Gestion des permissions
```

## 🔄 Flux de données

### Connexion d'un nouveau membre

1. **Authentification Discord** réussie
2. **Vérification** de l'existence en base
3. **Création** du profil si nouveau membre
4. **Synchronisation** des rôles Discord
5. **Redirection** vers le profil

### Mise à jour du profil

1. **Membre** accède à `/profile/edit`
2. **Formulaire** pré-rempli avec données actuelles
3. **Validation** des modifications
4. **API** `/api/members/profile` PUT
5. **Mise à jour** en base de données
6. **Enregistrement** de l'activité
7. **Notification** de succès

### Gestion des cotisations

1. **Bureau** accède à `/admin/subscriptions`
2. **Création** des cotisations pour l'année
3. **Notification** aux membres concernés
4. **Suivi** des paiements
5. **Mise à jour** automatique des statuts

## 🧪 Tests

### Tests unitaires

```typescript
// members.store.test.ts
describe('MembersStore', () => {
  test('should create member profile on first login', async () => {
    const store = new MembersStore()
    const discordUser = {
      /* ... */
    }
    const member = await store.createOrUpdateMember(discordUser)
    expect(member.id).toBeDefined()
    expect(member.profile).toBeDefined()
  })

  test('should check permissions correctly', () => {
    const permissionService = new PermissionService()
    const member = { roles: ['Membre'] }
    expect(permissionService.hasPermission(member, 'events', 'register')).toBe(
      true
    )
    expect(permissionService.hasPermission(member, 'members', 'manage')).toBe(
      false
    )
  })
})
```

### Tests d'intégration

```typescript
// members.api.test.ts
describe('Members API', () => {
  test('GET /api/members should return members list', async () => {
    const response = await request(app)
      .get('/api/members')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
    expect(response.body).toHaveProperty('members')
  })
})
```

## 📈 Analytics et Rapports

### Statistiques membres

- **Total membres** : Actifs, inactifs, suspendus
- **Nouveaux membres** : Par mois/année
- **Rétention** : Taux de participation
- **Cotisations** : Taux de paiement, montants

### Tableaux de bord

- **Membre** : Activité personnelle, événements à venir
- **Bureau** : Vue d'ensemble des membres et cotisations
- **Admin** : Statistiques complètes et rapports

## 🔔 Notifications

### Discord

- **Nouveau membre** : Notification au bureau
- **Cotisation due** : Rappel aux membres
- **Changement de rôle** : Notification au membre

### Email (optionnel)

- **Bienvenue** : Nouveau membre
- **Rappel cotisation** : 30 jours avant échéance
- **Confirmation paiement** : Cotisation payée

## 🚀 Roadmap

### Phase 1 - Base

- ✅ Authentification Discord
- ✅ Profils membres de base
- ✅ Système de rôles

### Phase 2 - Gestion

- ⏳ Gestion des cotisations
- ⏳ Historique des activités
- ⏳ Tableaux de bord

### Phase 3 - Avancé

- ⏳ Système de badges/achievements
- ⏳ Messagerie interne
- ⏳ Groupes et équipes

### Phase 4 - Analytics

- ⏳ Rapports avancés
- ⏳ Prédictions de rétention
- ⏳ Recommandations personnalisées

---

La gestion des membres est fondamentale pour le bon fonctionnement de l'association MO5.
