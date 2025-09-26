ALTER TABLE `event_slots` MODIFY COLUMN `period` varchar(20);--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `is_preferred` int unsigned DEFAULT 0;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD `can_switch` int unsigned DEFAULT 1;--> statement-breakpoint
ALTER TABLE `event_slots` ADD `hour_slot` int;--> statement-breakpoint
ALTER TABLE `event_slots` ADD `priority` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `event_slots` ADD `is_recurring` int unsigned DEFAULT 0;