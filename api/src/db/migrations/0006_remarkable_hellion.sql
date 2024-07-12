CREATE TABLE `desks` (
	`id` varchar(128) NOT NULL,
	`timetable_id` varchar(128),
	`desk` varchar(5) NOT NULL,
	`mac_address` varchar(12),
	`last_seen` timestamp NOT NULL DEFAULT (now()),
	`last_os` enum('UNKNOWN','WINDOWS','LINUX') NOT NULL DEFAULT 'UNKNOWN',
	CONSTRAINT `desks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `desks` ADD CONSTRAINT `desks_timetable_id_timetables_id_fk` FOREIGN KEY (`timetable_id`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;