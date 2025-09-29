Feature: Billeterie Publique
  En tant que visiteur ou membre de l'association MO5
  Je veux pouvoir acheter des billets pour les événements publics
  Afin de participer aux expositions et événements ouverts au public

  Background:
    Given qu'il existe un événement public "Exposition Retro Gaming"
    And que l'événement a une capacité de 100 personnes
    And que les billets sont en vente

  Scenario: Acheter un billet en tant que visiteur
    Given que je suis un visiteur non connecté
    When je vais sur la page de l'événement "Exposition Retro Gaming"
    And je clique sur "Acheter un billet"
    And je remplis le formulaire avec mon email et nom
    And je sélectionne le type de billet "Adulte - 15€"
    And je confirme l'achat
    Then mon billet est créé
    And je reçois un QR code unique
    And je reçois une confirmation par email
    And je suis redirigé vers la page de mon billet

  Scenario: Acheter un billet en tant que membre
    Given que je suis connecté en tant que membre
    And que j'ai un tarif préférentiel de 10€
    When je vais sur la page de l'événement "Exposition Retro Gaming"
    And je clique sur "Acheter un billet"
    Then je vois le tarif préférentiel de 10€
    And je peux acheter le billet au tarif membre

  Scenario: Valider un billet à l'entrée
    Given que je suis organisateur de l'événement
    And qu'un visiteur a acheté un billet
    When le visiteur arrive à l'entrée
    And il me montre son QR code
    And je scanne le QR code avec l'application de validation
    Then le billet est validé
    And le statut passe à "utilisé"
    And l'entrée est autorisée
    And la validation est enregistrée avec horodatage

  Scenario: Gérer les remboursements
    Given que je suis membre du bureau
    And qu'un visiteur a acheté un billet
    And que l'événement a été annulé
    When je vais sur la page de gestion des billets
    And je sélectionne le billet à rembourser
    And je clique sur "Rembourser"
    And je saisis la raison "Événement annulé"
    And je confirme le remboursement
    Then le billet passe au statut "remboursé"
    And le visiteur reçoit une notification de remboursement
    And le remboursement est traité

  Scenario: Gérer la capacité des billets
    Given que l'événement a une capacité de 100 billets
    And que 100 billets ont été vendus
    When un nouveau visiteur essaie d'acheter un billet
    Then il voit le message "Complet"
    And il peut s'inscrire sur liste d'attente
    And il reçoit une notification si une place se libère

  Scenario: Consulter mes billets achetés
    Given que j'ai acheté plusieurs billets
    When je vais sur la page "Mes billets"
    Then je vois la liste de tous mes billets
    And je peux voir le statut de chaque billet
    And je peux accéder au QR code de chaque billet
    And je peux voir les détails de chaque événement

  Scenario: Gérer les types de billets
    Given que je suis organisateur de l'événement
    When je vais sur la page de gestion des billets
    And je crée un nouveau type de billet "Étudiant - 8€"
    And je définis une capacité de 20 billets
    And j'active la vente
    Then le nouveau type de billet est disponible
    And les visiteurs peuvent l'acheter
    And la capacité est correctement gérée
