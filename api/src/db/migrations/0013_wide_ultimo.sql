CREATE TABLE `carousel_items` (
	`id` varchar(128) NOT NULL,
	`carousel_id` varchar(128),
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`type` enum('TIMETABLE','PICTURE','VIDEO','WEB') NOT NULL DEFAULT 'TIMETABLE',
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
ALTER TABLE `carousel_items` ADD CONSTRAINT `carousel_items_carousel_id_carousels_id_fk` FOREIGN KEY (`carousel_id`) REFERENCES `carousels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousel_items` ADD CONSTRAINT `carousel_items_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousels` ADD CONSTRAINT `carousels_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `carousels` ADD CONSTRAINT `carousels_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;