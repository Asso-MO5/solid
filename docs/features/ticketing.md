# 🎫 Feature: Billeterie Publique

## 📋 Description

Système de billeterie publique pour les événements de l'association MO5, permettant la vente de billets en ligne pour les expositions et événements ouverts au public.

## 🎯 Objectifs

- **Vente de billets** en ligne pour événements publics
- **Gestion des capacités** et listes d'attente
- **Paiement sécurisé** (intégration future)
- **QR codes** pour validation des billets
- **Gestion des remboursements** et annulations

## 🏗️ Architecture DDD

### Domaines identifiés

1. **Ticket Sales** : Vente et gestion des billets
2. **Payment Processing** : Traitement des paiements
3. **Ticket Validation** : Validation et contrôle d'accès
4. **Refund Management** : Gestion des remboursements

### Entités principales

```typescript
interface PublicEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  capacity: number
  price: number
  status: 'draft' | 'published' | 'sold_out' | 'cancelled' | 'completed'
  ticketTypes: TicketType[]
  organizerId: string
  publicInfo: PublicEventInfo
}

interface TicketType {
  id: string
  eventId: string
  name: string
  description: string
  price: number
  capacity: number
  available: number
  salesStart: Date
  salesEnd: Date
  requirements?: string[] // Âge minimum, etc.
}

interface Ticket {
  id: string
  eventId: string
  ticketTypeId: string
  buyerEmail: string
  buyerName: string
  buyerPhone?: string
  qrCode: string
  status: 'active' | 'used' | 'cancelled' | 'refunded'
  purchasedAt: Date
  usedAt?: Date
  price: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentId?: string
}

interface TicketValidation {
  id: string
  ticketId: string
  validatedAt: Date
  validatedBy: string // ID du validateur
  location: string // Point de contrôle
  notes?: string
}
```

## 🔐 Permissions et Rôles

### Accès public

- **Achat de billets** : Sans authentification
- **Consultation** : Événements publics uniquement

### Accès membre

- **Tarifs préférentiels** : Si configuré
- **Accès prioritaire** : Si configuré
- **Historique** : Billets achetés

### Accès organisateur

- **Gestion des billets** : Vente, validation
- **Statistiques** : Ventes, présences
- **Contrôle d'accès** : Validation QR codes

### Accès bureau

- **Gestion complète** : Tous les événements
- **Rapports** : Ventes, revenus
- **Remboursements** : Gestion des annulations

## 📊 Base de données

### Tables

```sql
-- Types de billets
CREATE TABLE ticket_types (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  capacity INT NOT NULL,
  available INT NOT NULL,
  sales_start DATETIME NOT NULL,
  sales_end DATETIME NOT NULL,
  requirements JSON, -- Âge minimum, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Billets
CREATE TABLE tickets (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  ticket_type_id VARCHAR(255) NOT NULL,
  buyer_email VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(20),
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('active', 'used', 'cancelled', 'refunded') DEFAULT 'active',
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP NULL,
  price DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE
);

-- Validations de billets
CREATE TABLE ticket_validations (
  id VARCHAR(255) PRIMARY KEY,
  ticket_id VARCHAR(255) NOT NULL,
  validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  validated_by VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  notes TEXT,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES members(id) ON DELETE CASCADE
);

-- Remboursements
CREATE TABLE ticket_refunds (
  id VARCHAR(255) PRIMARY KEY,
  ticket_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  processed_by VARCHAR(255) NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES members(id) ON DELETE CASCADE
);
```

## 🎨 Interface Utilisateur

### Pages publiques

1. **`/events`** : Liste des événements publics
2. **`/events/[id]`** : Détail d'un événement public
3. **`/events/[id]/tickets`** : Achat de billets
4. **`/tickets/[id]`** : Détail d'un billet (QR code)
5. **`/tickets/validate`** : Validation de billet (organisateur)

### Pages membres/organisateurs

1. **`/my-tickets`** : Billets achetés par le membre
2. **`/admin/events/[id]/tickets`** : Gestion des billets d'un événement
3. **`/admin/tickets/validate`** : Interface de validation

### Composants

```typescript
// Composants principaux
<PublicEventList />      // Liste des événements publics
<PublicEventCard />      // Carte d'événement public
<TicketPurchase />       // Achat de billets
<TicketQRCode />         // QR code du billet
<TicketValidator />      // Validation de billets
<TicketManagement />     // Gestion des billets
<RefundManager />        // Gestion des remboursements
```

## 🔄 Flux de données

### Achat de billet

1. **Visiteur** accède à `/events/[id]`
2. **Sélection** du type de billet
3. **Formulaire** de commande (email, nom, téléphone)
4. **Vérification** de la disponibilité
5. **API** `/api/events/[id]/tickets` POST
6. **Création** du billet avec QR code
7. **Confirmation** par email (si fourni)
8. **Redirection** vers le billet

### Validation de billet

1. **Organisateur** accède à `/tickets/validate`
2. **Scan** du QR code ou saisie manuelle
3. **Vérification** du statut du billet
4. **Validation** ou rejet
5. **Enregistrement** de la validation
6. **Notification** du résultat

### Remboursement

1. **Bureau/Organisateur** accède à la gestion des billets
2. **Sélection** du billet à rembourser
3. **Saisie** de la raison
4. **API** `/api/tickets/[id]/refund` POST
5. **Traitement** du remboursement
6. **Notification** au porteur du billet

## 💳 Paiement (Phase future)

### Intégration prévue

```typescript
interface PaymentProvider {
  name: 'stripe' | 'paypal' | 'lydia'
  config: {
    publicKey: string
    webhookSecret: string
  }
}

interface Payment {
  id: string
  ticketId: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
  provider: string
  providerPaymentId: string
  createdAt: Date
  completedAt?: Date
}
```

### Flux de paiement

1. **Sélection** du mode de paiement
2. **Redirection** vers le provider
3. **Paiement** sur la plateforme externe
4. **Webhook** de confirmation
5. **Activation** du billet
6. **Notification** de confirmation

## 🧪 Tests

### Tests unitaires

```typescript
// ticketing.store.test.ts
describe('TicketingStore', () => {
  test('should create ticket with valid data', async () => {
    const store = new TicketingStore()
    const ticketData = {
      /* ... */
    }
    const ticket = await store.createTicket(ticketData)
    expect(ticket.id).toBeDefined()
    expect(ticket.qrCode).toBeDefined()
  })

  test('should validate ticket correctly', async () => {
    const store = new TicketingStore()
    const ticket = await store.validateTicket('ticket-id', 'validator-id')
    expect(ticket.status).toBe('used')
  })
})
```

### Tests d'intégration

```typescript
// ticketing.api.test.ts
describe('Ticketing API', () => {
  test('POST /api/events/[id]/tickets should create ticket', async () => {
    const response = await request(app)
      .post('/api/events/event-id/tickets')
      .send(validTicketData)
      .expect(201)
    expect(response.body.qrCode).toBeDefined()
  })
})
```

## 📈 Analytics et Rapports

### Statistiques de vente

- **Billets vendus** : Par événement, par type
- **Revenus** : Totaux, par période
- **Taux de conversion** : Visiteurs vs acheteurs
- **Taux de présence** : Billets vendus vs utilisés

### Tableaux de bord

- **Organisateur** : Ventes de ses événements
- **Bureau** : Vue d'ensemble des ventes
- **Admin** : Rapports détaillés et export

## 🔔 Notifications

### Email automatiques

- **Confirmation d'achat** : Avec QR code
- **Rappel d'événement** : 24h avant
- **Confirmation de remboursement** : Si applicable

### Discord (organisateurs)

- **Nouvelle vente** : Notification en temps réel
- **Billet validé** : Confirmation de présence
- **Problème de paiement** : Alerte

## 🚀 Roadmap

### Phase 1 - Base

- ✅ Création et gestion des billets
- ✅ QR codes pour validation
- ✅ Interface publique de base

### Phase 2 - Paiement

- ⏳ Intégration Stripe/PayPal
- ⏳ Gestion des remboursements
- ⏳ Notifications email

### Phase 3 - Avancé

- ⏳ Billets nominatifs/groupes
- ⏳ Codes promo et réductions
- ⏳ Intégration calendrier

### Phase 4 - Analytics

- ⏳ Tableaux de bord avancés
- ⏳ Prédictions de vente
- ⏳ Optimisation des prix

---

La billeterie publique est essentielle pour monétiser les événements de l'association MO5.
