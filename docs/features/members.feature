Feature: Gestion des Membres
  En tant que membre de l'association MO5
  Je veux pouvoir gérer mon profil et mes informations
  Afin de participer pleinement à la vie de l'association

  Background:
    Given que je suis connecté avec mon compte Discord
    And que mon compte Discord est lié à l'association MO5

  Scenario: Premier connexion d'un nouveau membre
    Given que je me connecte pour la première fois avec Discord
    When le système vérifie mon compte Discord
    Then mon profil membre est créé automatiquement
    And mes rôles Discord sont synchronisés
    And je suis redirigé vers la page de profil
    And je peux compléter mes informations personnelles

  Scenario: Mettre à jour mon profil
    Given que je suis connecté en tant que membre
    When je vais sur la page de modification de profil
    And je modifie mon numéro de téléphone
    And j'ajoute une bio
    And je sélectionne mes centres d'intérêt
    And je sauvegarde les modifications
    Then mon profil est mis à jour
    And l'activité est enregistrée dans mon historique

  Scenario: Consulter la liste des membres
    Given que je suis connecté en tant que membre
    When je vais sur la page des membres
    Then je vois la liste des membres actifs
    And je peux voir les profils publics des autres membres
    And je peux filtrer par rôle ou statut

  Scenario: Gérer les cotisations en tant que bureau
    Given que je suis membre du bureau
    When je vais sur la page de gestion des cotisations
    And je crée les cotisations pour l'année 2024
    And je définis le montant à 25€
    And je sélectionne tous les membres actifs
    Then les cotisations sont créées pour tous les membres
    And chaque membre reçoit une notification de cotisation due
    And les échéances sont définies à 3 mois

  Scenario: Payer ma cotisation
    Given que j'ai une cotisation en attente
    When je vais sur ma page de profil
    And je clique sur "Payer ma cotisation"
    And je sélectionne le mode de paiement
    And je confirme le paiement
    Then ma cotisation passe au statut "payée"
    And je reçois une confirmation de paiement
    And mon statut de membre est maintenu

  Scenario: Consulter mon historique d'activité
    Given que je suis connecté en tant que membre
    When je vais sur mon tableau de bord
    Then je vois mon historique d'activité
    And je peux voir mes inscriptions aux événements
    And je peux voir mes paiements de cotisations
    And je peux voir mes modifications de profil

  Scenario: Gérer les permissions d'un membre
    Given que je suis membre du bureau
    And qu'il existe un membre "Jean Dupont"
    When je vais sur la page de gestion des membres
    And je sélectionne le membre "Jean Dupont"
    And je modifie ses rôles Discord
    And j'ajoute le rôle "Pôle Live"
    Then les permissions du membre sont mises à jour
    And le membre reçoit une notification de changement de rôle
    And il a maintenant accès aux outils du pôle Live
