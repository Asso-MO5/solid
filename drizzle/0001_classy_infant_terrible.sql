ALTER TABLE `events` ADD `event_category` enum('video','expo','ag','live','meeting','training','conference','other') NOT NULL;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `event_type`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `event_access`;