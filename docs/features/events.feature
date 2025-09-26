Feature: Gestion des Événements
  En tant que membre de l'association MO5
  Je veux pouvoir créer, modifier et m'inscrire aux événements
  Afin de participer à la vie de l'association

  Background:
    Given que je suis connecté avec mon compte Discord
    And que j'ai les permissions appropriées selon mon rôle

  Scenario: Créer un nouvel événement en tant que bureau
    Given que je suis membre du bureau
    When je vais sur la page de création d'événement
    And je remplis le formulaire avec les informations de l'événement
    And je sélectionne le type "public"
    And je définis une capacité de 50 personnes
    And je clique sur "Créer l'événement"
    Then l'événement est créé avec succès
    And je suis redirigé vers la page de l'événement
    And l'événement est visible dans la liste des événements publics

  Scenario: S'inscrire à un événement en tant que membre
    Given que je suis un membre de l'association
    And qu'il existe un événement "Formation SolidJS" ouvert aux membres
    When je vais sur la page de l'événement
    And je clique sur "S'inscrire"
    Then mon inscription est enregistrée
    And je reçois une confirmation d'inscription
    And l'organisateur est notifié de mon inscription

  Scenario: Gérer les inscriptions d'un événement
    Given que je suis l'organisateur d'un événement
    And que 5 membres se sont inscrits
    When je vais sur la page de gestion de l'événement
    Then je vois la liste des 5 inscriptions
    And je peux voir les informations de chaque inscrit
    And je peux ajouter des notes pour chaque inscription

  Scenario: Valider un billet d'événement public
    Given que je suis organisateur d'un événement public
    And qu'un visiteur a acheté un billet
    When le visiteur arrive à l'événement
    And il me montre son QR code
    And je scanne le QR code
    Then le billet est validé
    And le statut du billet passe à "utilisé"
    And l'entrée est autorisée

  Scenario: Gérer la capacité d'un événement
    Given qu'un événement a une capacité de 10 personnes
    And que 10 personnes sont déjà inscrites
    When un 11ème membre essaie de s'inscrire
    Then il est placé sur liste d'attente
    And il reçoit une notification d'attente
    And l'organisateur est notifié de la liste d'attente

  Scenario: Modifier un événement existant
    Given que je suis l'organisateur d'un événement
    And que l'événement est en statut "brouillon"
    When je vais sur la page de modification de l'événement
    And je modifie la description
    And je change la date de début
    And je sauvegarde les modifications
    Then l'événement est mis à jour
    And les inscrits sont notifiés des changements

  Scenario: Annuler un événement
    Given que je suis l'organisateur d'un événement
    And que 3 personnes sont inscrites
    When je vais sur la page de gestion de l'événement
    And je clique sur "Annuler l'événement"
    And je confirme l'annulation
    Then l'événement passe en statut "annulé"
    And tous les inscrits sont notifiés de l'annulation
    And les billets sont automatiquement remboursés
