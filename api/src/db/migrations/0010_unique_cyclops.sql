CREATE TABLE `campaign_media` (
	`campaign_id` varchar(128),
	`media_id` varchar(128)
);
--> statement-breakpoint
ALTER TABLE `campaign_items` DROP FOREIGN KEY `campaign_items_carousel_id_carousels_id_fk`;
--> statement-breakpoint
DROP INDEX `carousel_idx` ON `campaign_items`;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `type` enum('OTHER','WORKSHOP','LECTURE','SOCIAL','MAINTENANCE','EXAM','PROJECT','SUPPORT') NOT NULL DEFAULT 'OTHER';--> statement-breakpoint
ALTER TABLE `campaign_items` ADD `campaign_id` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `totp_enabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totp_secret` varchar(32);--> statement-breakpoint
ALTER TABLE `campaign_media` ADD CONSTRAINT `campaign_media_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_media` ADD CONSTRAINT `campaign_media_media_id_media_id_fk` FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_items` ADD CONSTRAINT `campaign_items_campaign_id_campaigns_id_fk` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaign_items` DROP COLUMN `carousel_id`;