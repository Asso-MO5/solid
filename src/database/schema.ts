import { mysqlTable, varchar, timestamp, mysqlEnum, int, text, decimal, datetime } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ============================================================================
// ENUMS
// ============================================================================
export const addressableTypeEnum = mysqlEnum('addressable_type', ['member', 'event', 'organization']);
export const responsibilityScopeEnum = mysqlEnum('responsibility_scope', ['bureau', 'pole_live', 'pole_video', 'pole_tech', 'pole_comm', 'other']);
export const eventStatusEnum = mysqlEnum('event_status', ['draft', 'published', 'cancelled', 'completed']);
export const eventCategoryEnum = mysqlEnum('event_category', ['video', 'expo', 'ag', 'live', 'meeting', 'training', 'conference', 'other']);
export const capacityTypeEnum = mysqlEnum('capacity_type', ['public', 'staff', 'member']);
export const slotTypeEnum = mysqlEnum('slot_type', ['installation', 'horaire', 'membre']);
export const slotAccessEnum = mysqlEnum('slot_access', ['public', 'staff', 'member', 'staff_and_public', 'invitation_only']);
export const registrationStatusEnum = mysqlEnum('registration_status', ['registered', 'waiting', 'cancelled']);
export const registrationRoleEnum = mysqlEnum('registration_role', ['staff', 'public', 'member']);

// ============================================================================
// TABLE: members
// ============================================================================
export const members = mysqlTable('members', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Identifiants externes
  discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
  providerId: varchar('provider_id', { length: 255 }), // Pour lier avec d'autres providers si besoin

  // Informations de base
  username: varchar('username', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  avatar: varchar('avatar', { length: 500 }),

  // Timestamps
  joinedAt: timestamp('joined_at').defaultNow(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().onUpdateNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: responsibilities
// ============================================================================
export const responsibilities = mysqlTable('responsibilities', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Membre responsable
  memberId: varchar('member_id', { length: 255 }).notNull(),

  // Titre de la responsabilité
  title: varchar('title', { length: 100 }), // "Président", "Responsable Vidéo", "Trésorier", etc.

  // Scope de la responsabilité
  scope: responsibilityScopeEnum, // bureau, pole_live, pole_video, etc.

  // Description détaillée
  description: text('description'),

  // Période de responsabilité
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'), // null = responsabilité active

  // Statut
  isActive: int('is_active', { unsigned: true }).default(1), // 0 ou 1

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: events
// ============================================================================
export const events = mysqlTable('events', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Informations de base
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 255 }).notNull().unique(), // URL-friendly

  // Informations publiques (visibles par tous)
  publicTitle: varchar('public_title', { length: 255 }), // Titre pour le public (peut différer)
  publicDescription: text('public_description'), // Description publique
  publicVisible: int('public_visible', { unsigned: true }).default(0), // 0 ou 1 - visible sur site public

  // Type et statut
  category: eventCategoryEnum.notNull(), // video, expo, ag, live, meeting, training, conference, other
  status: eventStatusEnum.default('draft'), // draft, published, cancelled, completed

  // Contrôle d'accès granulaire
  allowedRoles: text('allowed_roles'), // JSON array des rôles Discord autorisés
  allowedMembers: text('allowed_members'), // JSON array des IDs membres autorisés (pour accès restreint)
  isConfidential: int('is_confidential', { unsigned: true }).default(0), // 0 ou 1 - événement confidentiel

  // Organisateur
  organizerId: varchar('organizer_id', { length: 255 }).notNull(),

  // Horaires généraux
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  registrationStart: datetime('registration_start'), // Ouverture des inscriptions
  registrationEnd: datetime('registration_end'), // Fermeture des inscriptions

  // Capacité globale (optionnelle, pour les événements simples)
  maxCapacity: int('max_capacity'), // Nombre maximum de places total
  minCapacity: int('min_capacity'), // Nombre minimum pour que l'événement ait lieu

  // Liens externes
  externalUrl: varchar('external_url', { length: 500 }), // PGW, Japan Expo, etc.
  externalName: varchar('external_name', { length: 100 }), // Nom du site externe

  // Informations pratiques
  plan: text('plan'), // Plan de l'événement (JSON ou texte)
  internalNotes: text('internal_notes'), // Notes internes (non visibles par les membres)

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: event_schedules
// ============================================================================
export const eventSchedules = mysqlTable('event_schedules', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Événement parent
  eventId: varchar('event_id', { length: 255 }).notNull(),

  // Jour de l'événement
  date: datetime('date').notNull(), // Date du jour (sans heure)

  // Horaires du jour
  startTime: datetime('start_time').notNull(), // Heure de début du jour
  endTime: datetime('end_time').notNull(), // Heure de fin du jour

  // Capacités par type pour ce jour
  publicCapacity: int('public_capacity'), // Places publiques (si on les gère)
  staffCapacity: int('staff_capacity'), // Places staff nécessaires
  memberCapacity: int('member_capacity'), // Places membres

  // Capacités minimums
  minStaffRequired: int('min_staff_required'), // Staff minimum requis
  minMembersRequired: int('min_members_required'), // Membres minimum requis

  // Statut du jour
  isActive: int('is_active', { unsigned: true }).default(1), // 0 ou 1
  notes: text('notes'), // Notes spécifiques pour ce jour

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: event_slots
// ============================================================================
export const eventSlots = mysqlTable('event_slots', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Événement parent
  eventId: varchar('event_id', { length: 255 }).notNull(),

  // Jour et créneau
  date: datetime('date').notNull(), // Date du jour
  period: varchar('period', { length: 20 }).notNull(), // "morning", "afternoon", "full_day"

  // Type de créneau
  type: slotTypeEnum.notNull(), // installation, horaire, membre

  // Accès au créneau
  access: slotAccessEnum.notNull(), // public, staff, member, staff_and_public

  // Capacités pour ce créneau
  maxCapacity: int('max_capacity'), // Capacité maximum
  minCapacity: int('min_capacity'), // Capacité minimum

  // Horaires du créneau
  startTime: datetime('start_time').notNull(),
  endTime: datetime('end_time').notNull(),

  // Statut du créneau
  isActive: int('is_active', { unsigned: true }).default(1), // 0 ou 1
  isOpenForRegistration: int('is_open_for_registration', { unsigned: true }).default(1), // 0 ou 1

  // Invitations (pour les créneaux sur invitation)
  allowedRoles: text('allowed_roles'), // JSON array des rôles Discord autorisés
  allowedMembers: text('allowed_members'), // JSON array des IDs membres autorisés

  // Description du créneau
  description: text('description'),
  notes: text('notes'), // Notes internes

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: event_registrations
// ============================================================================
export const eventRegistrations = mysqlTable('event_registrations', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Membre qui s'inscrit
  memberId: varchar('member_id', { length: 255 }).notNull(),

  // Créneau d'inscription
  slotId: varchar('slot_id', { length: 255 }).notNull(),

  // Statut de l'inscription
  status: registrationStatusEnum.default('registered'), // registered, waiting, cancelled

  // Rôle dans l'événement (comment le membre s'inscrit)
  registrationRole: registrationRoleEnum.notNull(), // staff, public, member

  // Informations d'inscription
  registeredAt: timestamp('registered_at').defaultNow(),
  notes: text('notes'), // Notes du membre

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// TABLE: addresses
// ============================================================================
export const addresses = mysqlTable('addresses', {
  id: varchar('id', { length: 255 }).primaryKey().$defaultFn(() => createId()),

  // Relation avec l'entité (polymorphique)
  addressableType: addressableTypeEnum.notNull(),
  addressableId: varchar('addressable_id', { length: 255 }).notNull(),

  // Adresse
  street: varchar('street', { length: 255 }),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('France'),

  // Coordonnées GPS
  latitude: decimal('latitude', { precision: 10, scale: 8 }), // -90.00000000 à 90.00000000
  longitude: decimal('longitude', { precision: 11, scale: 8 }), // -180.00000000 à 180.00000000

  // Informations additionnelles
  label: varchar('label', { length: 100 }), // "Domicile", "Bureau", etc.
  isDefault: int('is_default', { unsigned: true }).default(0), // 0 ou 1

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================
export const membersRelations = relations(members, ({ many }) => ({
  addresses: many(addresses),
  responsibilities: many(responsibilities),
  organizedEvents: many(events),
  eventRegistrations: many(eventRegistrations),
}));

export const responsibilitiesRelations = relations(responsibilities, ({ one }) => ({
  member: one(members, {
    fields: [responsibilities.memberId],
    references: [members.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(members, {
    fields: [events.organizerId],
    references: [members.id],
  }),
  addresses: many(addresses),
  schedules: many(eventSchedules),
  slots: many(eventSlots),
}));

export const eventSchedulesRelations = relations(eventSchedules, ({ one }) => ({
  event: one(events, {
    fields: [eventSchedules.eventId],
    references: [events.id],
  }),
}));

export const eventSlotsRelations = relations(eventSlots, ({ one, many }) => ({
  event: one(events, {
    fields: [eventSlots.eventId],
    references: [events.id],
  }),
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  member: one(members, {
    fields: [eventRegistrations.memberId],
    references: [members.id],
  }),
  slot: one(eventSlots, {
    fields: [eventRegistrations.slotId],
    references: [eventSlots.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  member: one(members, {
    fields: [addresses.addressableId],
    references: [members.id],
    relationName: 'member_addresses',
  }),
  event: one(events, {
    fields: [addresses.addressableId],
    references: [events.id],
    relationName: 'event_addresses',
  }),
}));

// ============================================================================
// TYPES
// ============================================================================
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Responsibility = typeof responsibilities.$inferSelect;
export type NewResponsibility = typeof responsibilities.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventSchedule = typeof eventSchedules.$inferSelect;
export type NewEventSchedule = typeof eventSchedules.$inferInsert;
export type EventSlot = typeof eventSlots.$inferSelect;
export type NewEventSlot = typeof eventSlots.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
