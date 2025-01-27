CREATE TABLE `campaign_items` (
	`id` varchar(128) NOT NULL,
	`carousel_id` varchar(128),
	`name` varchar(128) NOT NULL,
	`order` int DEFAULT 0,
	`type` enum('TIMETABLE','MEDIA','PICTURE','VIDEO','WEB') NOT NULL DEFAULT 'TIMETABLE',
	`content_url` varchar(2000),
	`media_id` varchar(128),
	`is_deleted` boolean NOT NULL DEFAULT false,
	`duration_milliseconds` int NOT NULL DEFAULT 4500,
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	CONSTRAINT `campaign_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`order` int DEFAULT 0,
	`type` enum('TIMETABLE','MEDIA','PICTURE','VIDEO','WEB') NOT NULL DEFAULT 'TIMETABLE',
	`content_url` varchar(2000),
	`media_id` varchar(128),
	`is_deleted` boolean NOT NULL DEFAULT false,
	`duration_milliseconds` int NOT NULL DEFAULT 4500,
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carousel_group_campaigns` (
	`group_id` varchar(128),
	`carousels` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128)
);
--> statement-breakpoint
CREATE TABLE `carousel_groups` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`carousels` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`is_deleted` boolean DEFAULT false,
	CONSTRAINT `carousel_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `displayContent`;--> statement-breakpoint
DROP TABLE `displays`;--> statement-breakpoint
ALTER TABLE `carousel_items` MODIFY COLUMN `type` enum('TIMETABLE','MEDIA','PICTURE','VIDEO','WEB') NOT NULL DEFAULT 'TIMETABLE';--> statement-breakpoint
ALTER TABLE `carousel_items` ADD `media_id` varchar(128);--> statement-breakpoint
ALTER TABLE `carousels` ADD `mac_address` varchar(25);--> statement-breakpoint
ALTER TABLE `campaign_items` ADD CONSTRAINT `campaign_items_carousel_id_carousels_id_fk` FOREIGN KEY (`carousel_id`) REFERENCES `carousels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_items` ADD CONSTRAINT `campaign_items_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_items` ADD CONSTRAINT `campaign_items_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_group_campaigns` ADD CONSTRAINT `carousel_group_campaigns_group_id_carousel_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `carousel_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_group_campaigns` ADD CONSTRAINT `carousel_group_campaigns_carousels_carousels_id_fk` FOREIGN KEY (`carousels`) REFERENCES `carousels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_group_campaigns` ADD CONSTRAINT `carousel_group_campaigns_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_groups` ADD CONSTRAINT `carousel_groups_carousels_carousels_id_fk` FOREIGN KEY (`carousels`) REFERENCES `carousels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_groups` ADD CONSTRAINT `carousel_groups_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `carousel_idx` ON `campaign_items` (`carousel_id`);--> statement-breakpoint
ALTER TABLE `carousel_items` ADD CONSTRAINT `carousel_items_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;