# 🎯 Feature: Gestion des Événements

## 📋 Description

Système complet de gestion des événements pour l'association MO5, permettant la création, modification, et inscription aux événements avec différents niveaux d'accès.

## 🎯 Objectifs

- **Création d'événements** par le bureau et les pôles
- **Inscription des membres** aux événements (système Doodle-like)
- **Billeterie publique** pour les événements ouverts au public
- **Gestion des capacités** et listes d'attente
- **Historique** et statistiques des participations

## 🏗️ Architecture DDD

### Domaines identifiés

1. **Event Management** : Création, modification, suppression
2. **Event Registration** : Inscription des membres
3. **Public Ticketing** : Billeterie pour événements publics
4. **Event Analytics** : Statistiques et rapports

### Entités principales

```typescript
interface Event {
  id: string
  title: string
  description: string
  type: 'public' | 'member' | 'internal'
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  price: number // 0 pour gratuit
  organizerId: string
  organizerRole: 'bureau' | 'pole_live' | 'pole_video' | 'other'
  requirements: string[] // Rôles requis pour participer
  createdAt: Date
  updatedAt: Date
}

interface EventRegistration {
  id: string
  eventId: string
  userId: string
  status: 'registered' | 'waiting' | 'cancelled'
  registeredAt: Date
  notes?: string
}

interface EventTicket {
  id: string
  eventId: string
  userId?: string // null pour billets anonymes
  type: 'member' | 'public'
  price: number
  status: 'active' | 'used' | 'cancelled'
  purchasedAt: Date
  usedAt?: Date
}
```

## 🔐 Permissions et Rôles

### Création d'événements

- **Bureau** : Tous types d'événements
- **Pôles** : Événements de leur domaine
- **Membres** : Aucun (sauf demande spéciale)

### Inscription aux événements

- **Membres** : Événements ouverts aux membres
- **Public** : Événements publics (avec billeterie)
- **Bureau** : Accès prioritaire si nécessaire

### Gestion des événements

- **Organisateur** : Modification de ses événements
- **Bureau** : Gestion de tous les événements
- **Admin** : Accès complet

## 📊 Base de données

### Tables

```sql
-- Événements
CREATE TABLE events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('public', 'member', 'internal') NOT NULL,
  status ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  location VARCHAR(255),
  capacity INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  organizer_id VARCHAR(255) NOT NULL,
  organizer_role VARCHAR(50) NOT NULL,
  requirements JSON, -- Rôles requis
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inscriptions aux événements
CREATE TABLE event_registrations (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status ENUM('registered', 'waiting', 'cancelled') NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, user_id)
);

-- Billets
CREATE TABLE event_tickets (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255), -- null pour billets anonymes
  type ENUM('member', 'public') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'used', 'cancelled') NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE SET NULL
);
```

## 🎨 Interface Utilisateur

### Pages principales

1. **`/events`** : Liste des événements (selon rôle)
2. **`/events/new`** : Création d'événement (bureau/pôles)
3. **`/events/[id]`** : Détail d'un événement
4. **`/events/[id]/register`** : Inscription à un événement
5. **`/events/[id]/manage`** : Gestion d'un événement
6. **`/admin/events`** : Administration des événements

### Composants

```typescript
// Composants principaux
<EventList />           // Liste des événements
<EventCard />           // Carte d'événement
<EventForm />           // Formulaire création/modification
<EventRegistration />   // Inscription à un événement
<EventManagement />     // Gestion d'un événement
<EventAnalytics />      // Statistiques d'un événement
```

## 🔄 Flux de données

### Création d'événement

1. **Bureau/Pôle** accède à `/events/new`
2. **Formulaire** rempli avec validation
3. **API** `/api/events` POST
4. **Validation** des permissions et données
5. **Création** en base de données
6. **Notification** Discord (optionnelle)
7. **Redirection** vers l'événement créé

### Inscription à un événement

1. **Membre** accède à `/events/[id]`
2. **Vérification** des permissions d'inscription
3. **Vérification** de la capacité disponible
4. **API** `/api/events/[id]/register` POST
5. **Création** de l'inscription
6. **Notification** à l'organisateur
7. **Mise à jour** de l'interface

### Billeterie publique

1. **Public** accède à `/events/[id]`
2. **Sélection** du type de billet
3. **Formulaire** de commande
4. **API** `/api/events/[id]/tickets` POST
5. **Création** du billet
6. **Confirmation** par email (si fourni)
7. **QR Code** généré pour le billet

## 🧪 Tests

### Tests unitaires

```typescript
// events.store.test.ts
describe('EventsStore', () => {
  test('should create event with valid data', async () => {
    const store = new EventsStore()
    const eventData = {
      /* ... */
    }
    const event = await store.createEvent(eventData)
    expect(event.id).toBeDefined()
  })
})
```

### Tests d'intégration

```typescript
// events.api.test.ts
describe('Events API', () => {
  test('POST /api/events should create event', async () => {
    const response = await request(app)
      .post('/api/events')
      .send(validEventData)
      .expect(201)
    expect(response.body.id).toBeDefined()
  })
})
```

## 📈 Métriques et Analytics

### Statistiques par événement

- **Inscriptions** : Nombre total, confirmées, en attente
- **Taux de participation** : Inscrits vs présents
- **Revenus** : Pour événements payants
- **Démographie** : Répartition par rôles

### Tableaux de bord

- **Bureau** : Vue d'ensemble de tous les événements
- **Organisateur** : Statistiques de ses événements
- **Membre** : Historique de ses participations

## 🔔 Notifications

### Discord Webhooks

- **Nouvel événement** : Notification aux membres concernés
- **Inscription** : Notification à l'organisateur
- **Annulation** : Notification aux inscrits
- **Rappel** : 24h avant l'événement

### Email (optionnel)

- **Confirmation d'inscription**
- **Billets** pour événements publics
- **Rappels** d'événements

## 🚀 Roadmap

### Phase 1 - Base

- ✅ Création et modification d'événements
- ✅ Inscription des membres
- ✅ Gestion des capacités

### Phase 2 - Billeterie

- ⏳ Billeterie publique
- ⏳ Paiement en ligne
- ⏳ QR codes pour billets

### Phase 3 - Avancé

- ⏳ Système de listes d'attente
- ⏳ Événements récurrents
- ⏳ Templates d'événements
- ⏳ Intégration calendrier

### Phase 4 - Analytics

- ⏳ Tableaux de bord avancés
- ⏳ Rapports personnalisés
- ⏳ Prédictions de participation

---

Cette feature est au cœur du système MO5 et évolue selon les besoins de l'association.
