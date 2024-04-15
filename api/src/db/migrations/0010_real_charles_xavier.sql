CREATE TABLE `logs` (
	`id` varchar(128) NOT NULL,
	`user` varchar(128) NOT NULL,
	`message` text NOT NULL,
	`time` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timetable_group_members` (
	`group_id` varchar(128),
	`timetable_id` varchar(128)
);
--> statement-breakpoint
CREATE TABLE `timetable_groups` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128),
	`subtitle` varchar(128),
	`last_modified` timestamp NOT NULL,
	`modified_by_id` varchar(128),
	CONSTRAINT `timetable_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `logs` ADD CONSTRAINT `logs_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_group_members` ADD CONSTRAINT `timetable_group_members_group_id_timetable_groups_id_fk` FOREIGN KEY (`group_id`) REFERENCES `timetable_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_group_members` ADD CONSTRAINT `timetable_group_members_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD CONSTRAINT `timetable_groups_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;