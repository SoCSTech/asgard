ALTER TABLE `events` MODIFY COLUMN `start` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `end` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `last_modified` timestamp NOT NULL;