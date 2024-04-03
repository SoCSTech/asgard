ALTER TABLE `events` MODIFY COLUMN `name` varchar(128) NOT NULL DEFAULT 'Unnamed Event';--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `timetable_id`;--> statement-breakpoint
ALTER TABLE `events` DROP COLUMN `modified_by_id`;