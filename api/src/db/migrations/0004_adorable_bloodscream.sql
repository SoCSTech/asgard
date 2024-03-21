CREATE TABLE `timetables` (
	`id` varchar(128) NOT NULL,
	`space_code` varchar(10) NOT NULL,
	`name` varchar(256) NOT NULL,
	`creation_date` timestamp NOT NULL DEFAULT (now()),
	`capacity` int,
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `timetables_id` PRIMARY KEY(`id`),
	CONSTRAINT `space_code_idx` UNIQUE(`space_code`)
);
