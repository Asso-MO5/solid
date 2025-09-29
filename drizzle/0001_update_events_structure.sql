-- Migration pour mettre à jour la structure des événements
-- Suppression des champs redondants et ajout des catégories

-- Ajouter le nouvel enum pour les catégories
ALTER TABLE `events` ADD COLUMN `event_category` enum('video','expo','ag','live','meeting','training','conference','other') NOT NULL DEFAULT 'other' AFTER `public_visible`;

-- Supprimer les anciens champs redondants
ALTER TABLE `events` DROP COLUMN `event_type`;
ALTER TABLE `events` DROP COLUMN `event_access`;

-- Renommer event_status en status pour plus de clarté
ALTER TABLE `events` CHANGE COLUMN `event_status` `status` enum('draft','published','cancelled','completed') DEFAULT 'draft';
