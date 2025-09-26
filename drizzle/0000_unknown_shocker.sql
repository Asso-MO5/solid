CREATE TABLE `addresses` (
	`id` varchar(255) NOT NULL,
	`addressable_type` enum('member','event','organization') NOT NULL,
	`addressable_id` varchar(255) NOT NULL,
	`street` varchar(255),
	`city` varchar(100),
	`postal_code` varchar(20),
	`country` varchar(100) DEFAULT 'France',
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`label` varchar(100),
	`is_default` int unsigned DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` varchar(255) NOT NULL,
	`member_id` varchar(255) NOT NULL,
	`slot_id` varchar(255) NOT NULL,
	`registration_status` enum('registered','waiting','cancelled') DEFAULT 'registered',
	`registration_role` enum('staff','public','member') NOT NULL,
	`registered_at` timestamp DEFAULT (now()),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_schedules` (
	`id` varchar(255) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`public_capacity` int,
	`staff_capacity` int,
	`member_capacity` int,
	`min_staff_required` int,
	`min_members_required` int,
	`is_active` int unsigned DEFAULT 1,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `event_slots` (
	`id` varchar(255) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`date` datetime NOT NULL,
	`period` varchar(20) NOT NULL,
	`slot_type` enum('installation','horaire','membre') NOT NULL,
	`slot_access` enum('public','staff','member','staff_and_public','invitation_only') NOT NULL,
	`max_capacity` int,
	`min_capacity` int,
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`is_active` int unsigned DEFAULT 1,
	`is_open_for_registration` int unsigned DEFAULT 1,
	`allowed_roles` text,
	`allowed_members` text,
	`description` text,
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`slug` varchar(255) NOT NULL,
	`public_title` varchar(255),
	`public_description` text,
	`public_visible` int unsigned DEFAULT 0,
	`event_type` enum('public','member','internal') NOT NULL,
	`event_status` enum('draft','published','cancelled','completed') DEFAULT 'draft',
	`event_access` enum('public','member_only','invitation_only') DEFAULT 'member_only',
	`allowed_roles` text,
	`allowed_members` text,
	`is_confidential` int unsigned DEFAULT 0,
	`organizer_id` varchar(255) NOT NULL,
	`start_date` datetime NOT NULL,
	`end_date` datetime NOT NULL,
	`registration_start` datetime,
	`registration_end` datetime,
	`max_capacity` int,
	`min_capacity` int,
	`external_url` varchar(500),
	`external_name` varchar(100),
	`plan` text,
	`internal_notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` varchar(255) NOT NULL,
	`discord_id` varchar(255) NOT NULL,
	`provider_id` varchar(255),
	`username` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`email` varchar(255),
	`avatar` varchar(500),
	`joined_at` timestamp DEFAULT (now()),
	`last_activity_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_discord_id_unique` UNIQUE(`discord_id`)
);
--> statement-breakpoint
CREATE TABLE `responsibilities` (
	`id` varchar(255) NOT NULL,
	`member_id` varchar(255) NOT NULL,
	`title` varchar(100),
	`responsibility_scope` enum('bureau','pole_live','pole_video','pole_tech','pole_comm','other'),
	`description` text,
	`start_date` timestamp DEFAULT (now()),
	`end_date` timestamp,
	`is_active` int unsigned DEFAULT 1,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `responsibilities_id` PRIMARY KEY(`id`)
);
