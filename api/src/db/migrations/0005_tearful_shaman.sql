CREATE TABLE `events` (
	`id` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`module_code` varchar(20),
	`timetable_id` varchar(128),
	`type` enum('OTHER','WORKSHOP','LECTURE','SOCIAL','MAINTENANCE','EXAM','PROJECT') NOT NULL DEFAULT 'OTHER',
	`colour` varchar(7),
	`start` timestamp NOT NULL,
	`end` timestamp NOT NULL,
	`last_modified` timestamp NOT NULL DEFAULT (now()),
	`modified_by_id` varchar(128),
	`is_combined_session` boolean DEFAULT false,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `timetables` ADD `can_combine` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `timetables` ADD `combined_partner_id` varchar(128);