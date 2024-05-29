CREATE TABLE `carousel_items` (
	`id` varchar(128) NOT NULL,
	`carousel_id` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`type` enum('TIMETABLE','PICTURE','VIDEO','WEB') NOT NULL DEFAULT 'TIMETABLE',
	`content_url` varchar(2000),
	`name` varchar(128) NOT NULL,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`duration_milliseconds` int NOT NULL DEFAULT 4500,
	`order` int DEFAULT 0,
	CONSTRAINT `carousel_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carousels` (
	`id` varchar(128) NOT NULL,
	`timetable_id` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `carousels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128),
	`staff` varchar(128),
	`module_code` varchar(20),
	`timetable_id` varchar(128),
	`type` enum('OTHER','WORKSHOP','LECTURE','SOCIAL','MAINTENANCE','EXAM','PROJECT') NOT NULL DEFAULT 'OTHER',
	`colour` varchar(7),
	`start` timestamp NOT NULL,
	`end` timestamp NOT NULL,
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`is_combined_session` boolean DEFAULT false,
	`group` varchar(10),
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logs` (
	`id` varchar(128) NOT NULL,
	`user` varchar(128),
	`message` text NOT NULL,
	`time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetable_group_members` (
	`group_id` varchar(128),
	`timetable_id` varchar(128),
	`order` int DEFAULT 0,
	`location` enum('UPSTAIRS','DOWNSTAIRS','LEFT','RIGHT','FORWARD','BACKWARD')
);
--> statement-breakpoint
CREATE TABLE `timetable_groups` (
	`id` varchar(128) NOT NULL,
	`internal_name` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`subtitle` varchar(128) NOT NULL,
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`is_deleted` boolean DEFAULT false,
	`display_info_pane` boolean DEFAULT false,
	`info_pane_text` text,
	`display_info_pane_qr` boolean DEFAULT false,
	`info_pane_qr_url` varchar(256),
	`object` varchar(30) NOT NULL DEFAULT 'room',
	`verb_available` varchar(30) NOT NULL DEFAULT 'free',
	`verb_unavailable` varchar(30) NOT NULL DEFAULT 'in use',
	CONSTRAINT `timetable_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetables` (
	`id` varchar(128) NOT NULL,
	`space_code` varchar(10) NOT NULL,
	`name` varchar(256) NOT NULL,
	`creation_date` timestamp NOT NULL DEFAULT (now()),
	`capacity` int,
	`can_combine` boolean NOT NULL DEFAULT false,
	`combined_partner_id` varchar(128),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `timetables_id` PRIMARY KEY(`id`),
	CONSTRAINT `space_code_idx` UNIQUE(`space_code`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`username` varchar(50) NOT NULL,
	`short_name` varchar(50) NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`initials` varchar(3) NOT NULL,
	`role` enum('TECHNICIAN','STANDARD') NOT NULL DEFAULT 'STANDARD',
	`email` varchar(256) NOT NULL,
	`password` char(60),
	`creation_date` timestamp NOT NULL DEFAULT (now()),
	`reset_token` char(8),
	`reset_token_expiry` timestamp,
	`profile_picture_url` varchar(256),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`),
	CONSTRAINT `username_idx` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE INDEX `carousel_idx` ON `carousel_items` (`carousel_id`);--> statement-breakpoint
CREATE INDEX `timetable_idx` ON `carousels` (`timetable_id`);--> statement-breakpoint
CREATE INDEX `timetable_idx` ON `events` (`timetable_id`);--> statement-breakpoint
CREATE INDEX `start_idx` ON `events` (`start`);--> statement-breakpoint
CREATE INDEX `end_idx` ON `events` (`end`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `logs` (`user`);--> statement-breakpoint
CREATE INDEX `timetable_idx` ON `timetable_group_members` (`timetable_id`);--> statement-breakpoint
CREATE INDEX `group_idx` ON `timetable_group_members` (`group_id`);--> statement-breakpoint
ALTER TABLE `carousel_items` ADD CONSTRAINT `carousel_items_carousel_id_carousels_id_fk` FOREIGN KEY (`carousel_id`) REFERENCES `carousels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_items` ADD CONSTRAINT `carousel_items_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousels` ADD CONSTRAINT `carousels_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousels` ADD CONSTRAINT `carousels_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `logs` ADD CONSTRAINT `logs_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_group_members` ADD CONSTRAINT `timetable_group_members_group_id_timetable_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `timetable_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_group_members` ADD CONSTRAINT `timetable_group_members_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD CONSTRAINT `timetable_groups_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;