# 🗄️ Schéma de Base de Données - MO5

## 📋 Vue d'ensemble

Le schéma de base de données pour l'espace membre MO5 est conçu pour supporter tous les aspects de la gestion d'association : membres, événements, billeterie, cotisations, et outils spécialisés.

## 🏗️ Architecture

### Technologies

- **SGBD** : MySQL 8.0+
- **ORM** : Drizzle ORM
- **Migrations** : Drizzle Kit
- **Types** : TypeScript avec génération automatique

### Principes de conception

- **Normalisation** : Éviter la redondance
- **Intégrité référentielle** : Contraintes FK
- **Performance** : Index sur les colonnes fréquemment utilisées
- **Évolutivité** : Structure modulaire

## 📊 Tables Principales

### 👥 Gestion des Membres

```sql
-- Table des membres (synchronisée avec Discord)
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
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_discord_id (discord_id),
  INDEX idx_status (status),
  INDEX idx_joined_at (joined_at)
);

-- Profils détaillés des membres
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

  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member_id (member_id)
);

-- Cotisations des membres
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
  UNIQUE KEY unique_member_year (member_id, year),
  INDEX idx_member_id (member_id),
  INDEX idx_year (year),
  INDEX idx_status (status)
);

-- Activités des membres
CREATE TABLE member_activities (
  id VARCHAR(255) PRIMARY KEY,
  member_id VARCHAR(255) NOT NULL,
  type ENUM('event_registration', 'event_participation', 'subscription_payment', 'profile_update') NOT NULL,
  description VARCHAR(500) NOT NULL,
  metadata JSON, -- Données additionnelles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member_id (member_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);
```

### 🎯 Gestion des Événements

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
  requirements JSON, -- Rôles requis pour participer
  public_info JSON, -- Informations publiques
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organizer_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_organizer_id (organizer_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_type_status (type, status)
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
  UNIQUE KEY unique_registration (event_id, user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

### 🎫 Billeterie Publique

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

  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id),
  INDEX idx_sales_period (sales_start, sales_end)
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
  FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id),
  INDEX idx_qr_code (qr_code),
  INDEX idx_buyer_email (buyer_email),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status)
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
  FOREIGN KEY (validated_by) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_validated_by (validated_by),
  INDEX idx_validated_at (validated_at)
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
  FOREIGN KEY (processed_by) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_processed_by (processed_by),
  INDEX idx_status (status)
);
```

### 🎬 Outils Pôles Spécialisés

```sql
-- Scripts pour pôle Live/Vidéo
CREATE TABLE scripts (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('live', 'video', 'presentation') NOT NULL,
  status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft',
  author_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255), -- Optionnel, lié à un événement
  tags JSON, -- Tags pour catégorisation
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_author_id (author_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_event_id (event_id)
);

-- Planning pour pôles
CREATE TABLE schedules (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  location VARCHAR(255),
  type ENUM('rehearsal', 'recording', 'live', 'meeting') NOT NULL,
  organizer_id VARCHAR(255) NOT NULL,
  participants JSON, -- IDs des participants
  resources JSON, -- Ressources nécessaires
  status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (organizer_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_organizer_id (organizer_id),
  INDEX idx_type (type),
  INDEX idx_start_time (start_time),
  INDEX idx_status (status)
);
```

### 🏛️ Gestion de la Collection

```sql
-- Objets de la collection
CREATE TABLE collection_items (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  condition ENUM('excellent', 'good', 'fair', 'poor') NOT NULL,
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  location VARCHAR(255),
  status ENUM('available', 'on_loan', 'maintenance', 'archived') DEFAULT 'available',
  photos JSON, -- URLs des photos
  metadata JSON, -- Informations additionnelles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_acquisition_date (acquisition_date)
);

-- Prêts d'objets
CREATE TABLE collection_loans (
  id VARCHAR(255) PRIMARY KEY,
  item_id VARCHAR(255) NOT NULL,
  borrower_id VARCHAR(255) NOT NULL,
  loan_date DATE NOT NULL,
  return_date DATE,
  expected_return_date DATE NOT NULL,
  purpose TEXT,
  status ENUM('active', 'returned', 'overdue', 'lost') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (item_id) REFERENCES collection_items(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_item_id (item_id),
  INDEX idx_borrower_id (borrower_id),
  INDEX idx_status (status),
  INDEX idx_expected_return_date (expected_return_date)
);
```

## 🔗 Relations et Contraintes

### Contraintes d'intégrité référentielle

```sql
-- Membres
ALTER TABLE member_profiles ADD CONSTRAINT fk_member_profiles_member
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_member
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE member_activities ADD CONSTRAINT fk_member_activities_member
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Événements
ALTER TABLE events ADD CONSTRAINT fk_events_organizer
  FOREIGN KEY (organizer_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE event_registrations ADD CONSTRAINT fk_event_registrations_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE event_registrations ADD CONSTRAINT fk_event_registrations_user
  FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE;

-- Billeterie
ALTER TABLE ticket_types ADD CONSTRAINT fk_ticket_types_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE tickets ADD CONSTRAINT fk_tickets_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE tickets ADD CONSTRAINT fk_tickets_ticket_type
  FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) ON DELETE CASCADE;

-- Outils spécialisés
ALTER TABLE scripts ADD CONSTRAINT fk_scripts_author
  FOREIGN KEY (author_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE scripts ADD CONSTRAINT fk_scripts_event
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

ALTER TABLE schedules ADD CONSTRAINT fk_schedules_organizer
  FOREIGN KEY (organizer_id) REFERENCES members(id) ON DELETE CASCADE;

-- Collection
ALTER TABLE collection_loans ADD CONSTRAINT fk_collection_loans_item
  FOREIGN KEY (item_id) REFERENCES collection_items(id) ON DELETE CASCADE;

ALTER TABLE collection_loans ADD CONSTRAINT fk_collection_loans_borrower
  FOREIGN KEY (borrower_id) REFERENCES members(id) ON DELETE CASCADE;
```

## 📈 Index et Performance

### Index composés pour les requêtes fréquentes

```sql
-- Recherche d'événements par type et statut
CREATE INDEX idx_events_type_status ON events(type, status);

-- Recherche d'inscriptions par événement et statut
CREATE INDEX idx_event_registrations_event_status ON event_registrations(event_id, status);

-- Recherche de billets par événement et statut
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);

-- Recherche d'activités par membre et type
CREATE INDEX idx_member_activities_member_type ON member_activities(member_id, type);

-- Recherche de cotisations par membre et année
CREATE INDEX idx_subscriptions_member_year ON subscriptions(member_id, year);
```

### Index pour les recherches textuelles

```sql
-- Recherche dans les titres d'événements
CREATE FULLTEXT INDEX idx_events_title ON events(title);

-- Recherche dans les descriptions d'événements
CREATE FULLTEXT INDEX idx_events_description ON events(description);

-- Recherche dans les noms d'objets de collection
CREATE FULLTEXT INDEX idx_collection_items_name ON collection_items(name);
```

## 🔄 Migrations et Évolution

### Structure des migrations

```typescript
// drizzle/migrations/0001_initial_schema.sql
-- Migration initiale avec toutes les tables

// drizzle/migrations/0002_add_ticketing.sql
-- Ajout des tables de billeterie

// drizzle/migrations/0003_add_collection.sql
-- Ajout de la gestion de collection
```

### Versioning du schéma

- **Versioning sémantique** : 1.0.0, 1.1.0, 2.0.0
- **Migrations rétrocompatibles** : Ajout de colonnes nullable
- **Rollback** : Scripts de rollback pour chaque migration
- **Tests** : Validation du schéma après chaque migration

## 🧪 Tests de Base de Données

### Tests d'intégrité

```typescript
// database/integrity.test.ts
describe('Database Integrity', () => {
  test('should maintain referential integrity', async () => {
    // Test des contraintes FK
  })

  test('should enforce unique constraints', async () => {
    // Test des contraintes d'unicité
  })
})
```

### Tests de performance

```typescript
// database/performance.test.ts
describe('Database Performance', () => {
  test('should query events efficiently', async () => {
    // Test des requêtes fréquentes
  })

  test('should handle concurrent access', async () => {
    // Test de concurrence
  })
})
```

## 📊 Monitoring et Maintenance

### Métriques importantes

- **Taille des tables** : Croissance des données
- **Performance des requêtes** : Temps d'exécution
- **Utilisation des index** : Efficacité des index
- **Intégrité des données** : Contraintes respectées

### Maintenance régulière

- **Nettoyage** : Suppression des données obsolètes
- **Optimisation** : Réorganisation des index
- **Sauvegarde** : Backups réguliers
- **Monitoring** : Surveillance des performances

---

Ce schéma évolue avec les besoins de l'association MO5 tout en maintenant la cohérence et les performances.
