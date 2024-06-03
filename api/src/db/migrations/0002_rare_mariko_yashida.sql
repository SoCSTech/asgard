ALTER TABLE `events` ADD `external_id` varchar(128);--> statement-breakpoint
CREATE INDEX `external_idx` ON `events` (`external_id`);