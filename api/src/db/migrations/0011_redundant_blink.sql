ALTER TABLE `events` MODIFY COLUMN `last_modified` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `timetable_groups` MODIFY COLUMN `name` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `timetable_groups` MODIFY COLUMN `subtitle` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `timetable_groups` MODIFY COLUMN `last_modified` timestamp NOT NULL DEFAULT (now());