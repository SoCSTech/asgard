ALTER TABLE `events` MODIFY COLUMN `name` varchar(128);--> statement-breakpoint
ALTER TABLE `events` ADD `staff` varchar(128);--> statement-breakpoint
ALTER TABLE `events` ADD `timetable_id` varchar(128);--> statement-breakpoint
ALTER TABLE `events` ADD `modified_by_id` varchar(128);--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_modified_by_id_users_id_fk` FOREIGN KEY (`modified_by_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;