ALTER TABLE `timetable_groups` ADD `internal_name` varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `display_info_pane` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `info_pane_text` text;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `info_pane_qr` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `timetable_groups` ADD `info_pane_qr_url` varchar(256);