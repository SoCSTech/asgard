CREATE TABLE `user_timetables` (
	`user` varchar(128),
	`timetable` varchar(128)
);
--> statement-breakpoint
ALTER TABLE `user_timetables` ADD CONSTRAINT `user_timetables_user_users_id_fk` FOREIGN KEY (`user`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_timetables` ADD CONSTRAINT `user_timetables_timetable_timetables_id_fk` FOREIGN KEY (`timetable`) REFERENCES `timetables`(`id`) ON DELETE no action ON UPDATE no action;