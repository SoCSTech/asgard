CREATE TABLE `displayContent` (
	`display` varchar(128),
	`content_type` enum('TIMETABLE','GROUP','PICTURE','VIDEO','WEB') NOT NULL,
	`timetable` varchar(128),
	`timetable_group` varchar(128),
	`media` varchar(128)
);
--> statement-breakpoint
CREATE TABLE `displays` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128),
	`mac_address` varchar(25),
	`modified_by_id` varchar(128),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `displays_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128),
	`url` varchar(256),
	`file_name` varchar(128),
	`content_type` varchar(32),
	`modified_by_id` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `displayContent` ADD CONSTRAINT `displayContent_display_displays_id_fk` FOREIGN KEY (`display`) REFERENCES `displays`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `displayContent` ADD CONSTRAINT `displayContent_timetable_timetables_id_fk` FOREIGN KEY (`timetable`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `displayContent` ADD CONSTRAINT `displayContent_timetable_group_timetable_groups_id_fk` FOREIGN KEY (`timetable_group`) REFERENCES `timetable_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `displayContent` ADD CONSTRAINT `displayContent_media_media_id_fk` FOREIGN KEY (`media`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `displays` ADD CONSTRAINT `displays_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;