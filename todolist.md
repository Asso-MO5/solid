# 📋 Todo List - MO5 Musée

## 🎯 Application 'solid'

### 📅 Gestion des horaires

- [ ] Créer les horaires (CRUD complet)
  - [ ] Créer un horaire récurrent (par jour de la semaine)
  - [ ] Créer une exception d'horaire (dates spécifiques)
  - [ ] Lire/Liste des horaires
  - [ ] Modifier un horaire
  - [ ] Supprimer un horaire
  - [ ] Interface de gestion des horaires
  - [ ] Validation des contraintes (exceptions avec dates, horaires récurrents avec jour)

### 💰 Gestion des tarifs

- [ ] Créer les tarifs (CRUD complet)
  - [ ] Créer un tarif
  - [ ] Lire/Liste des tarifs
  - [ ] Modifier un tarif
  - [ ] Supprimer un tarif
  - [ ] Types de tarifs (adulte, enfant, réduit, groupe, etc.)
  - [ ] Tarifs par période (dates spécifiques)
  - [ ] Interface de gestion des tarifs

### 👥 Gestion de la capacité

- [ ] Définir la capacité du musée
  - [ ] Capacité maximale globale
  - [ ] Capacité par créneau horaire
  - [ ] Capacité par type d'audience (public, membre)
  - [ ] Gestion des réservations vs capacité
  - [ ] Interface de configuration de la capacité

### 📊 Statistiques et rapports

- [ ] Nombre de visiteurs prévu

  - [ ] Par jour
  - [ ] Par mois
  - [ ] Cumul (total)
  - [ ] Graphiques et visualisations
  - [ ] Export des données

- [ ] Montant engendré
  - [ ] Par jour
  - [ ] Par mois
  - [ ] Cumul (total)
  - [ ] Par type de tarif
  - [ ] Graphiques et visualisations
  - [ ] Export des données

---

## 🔧 Backend 'ocelot'

### 💳 Système de paiement

- [ ] Créer un paiement
  - [ ] Intégration avec SumUp (ou autre solution)
  - [ ] Gestion des transactions
  - [ ] Statuts de paiement (en attente, payé, échoué, remboursé)
  - [ ] Webhooks pour les notifications de paiement
  - [ ] API pour créer un paiement
  - [ ] Validation et sécurité des paiements

### 📧 Emails de confirmation

- [ ] Envoyer un email de confirmation
  - [ ] Email après achat de billet
  - [ ] Email avec QR code / billet
  - [ ] Email de rappel (optionnel)
  - [ ] Template d'email
  - [ ] Gestion des erreurs d'envoi
  - [ ] Logs des emails envoyés

---

## 🎫 Application 'liquid' (Billeterie)

### 📅 Intégration calendrier

- [ ] Ajouter la billeterie avec le calendrier
  - [ ] Affichage du calendrier des disponibilités
  - [ ] Sélection de date et créneau horaire
  - [ ] Affichage des horaires du musée
  - [ ] Indication des créneaux complets
  - [ ] Réservation en temps réel

### 💰 Gestion des tarifs

- [ ] Afficher les tarifs
  - [ ] Liste des tarifs disponibles
  - [ ] Calcul automatique selon le type de visiteur
  - [ ] Tarifs réduits (si applicable)
  - [ ] Tarifs de groupe
  - [ ] Affichage du total

### 💳 Formulaire SumUp

- [ ] Intégrer le formulaire de paiement SumUp
  - [ ] Formulaire de saisie des informations
  - [ ] Intégration avec l'API SumUp
  - [ ] Gestion des erreurs de paiement
  - [ ] Redirection après paiement
  - [ ] Confirmation de commande
  - [ ] Validation des données avant paiement

---

## 🔗 Intégrations transversales

- [ ] Synchronisation des données entre les applications
- [ ] Gestion des erreurs et logs
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API
- [ ] Sécurité et authentification
