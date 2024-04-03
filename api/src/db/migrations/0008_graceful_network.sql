ALTER TABLE `events` MODIFY COLUMN `start` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `end` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `last_modified` datetime NOT NULL;