CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`username` varchar(50) NOT NULL,
	`short_name` varchar(50) NOT NULL,
	`full_name` varchar(256) NOT NULL,
	`role` enum('TECHNICIAN','STANDARD') NOT NULL DEFAULT 'STANDARD',
	`email` varchar(256) NOT NULL,
	`password` char(60),
	`creation_date` timestamp NOT NULL DEFAULT (now()),
	`reset_token` char(8),
	`reset_token_expiry` timestamp,
	`profile_picture_url` varchar(256),
	`is_deleted` boolean NOT NULL DEFAULT false,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_idx` UNIQUE(`email`),
	CONSTRAINT `username_idx` UNIQUE(`username`)
);
