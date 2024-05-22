ALTER TABLE `timetable_groups` ADD `object` varchar(30) DEFAULT 'rooms' NOT NULL;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `verb_available` varchar(30) DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `verb_unavailable` varchar(30) DEFAULT 'in use' NOT NULL;