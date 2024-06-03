import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, primaryKey, varchar, timestamp, mysqlEnum, tinyint, int, text, unique, char } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const carousel_items = mysqlTable("carousel_items", {
	id: varchar("id", { length: 128 }).notNull(),
	carousel_id: varchar("carousel_id", { length: 128 }).references(() => carousels.id),
	last_modified: timestamp("last_modified", { mode: 'string' }).default(sql`(now())`).notNull(),
	modified_by_id: varchar("modified_by_id", { length: 128 }).references(() => users.id),
	type: mysqlEnum("type", ['TIMETABLE','PICTURE','VIDEO','WEB']).default('TIMETABLE').notNull(),
	content_url: varchar("content_url", { length: 2000 }),
	name: varchar("name", { length: 128 }).notNull(),
	is_deleted: tinyint("is_deleted").default(0).notNull(),
	duration_milliseconds: int("duration_milliseconds").default(4500).notNull(),
	order: int("order").default(0),
},
(table) => {
	return {
		carousel_idx: index("carousel_idx").on(table.carousel_id),
		carousel_items_id: primaryKey({ columns: [table.id], name: "carousel_items_id"}),
	}
});

export const carousels = mysqlTable("carousels", {
	id: varchar("id", { length: 128 }).notNull(),
	timetable_id: varchar("timetable_id", { length: 128 }).references(() => timetables.id),
	last_modified: timestamp("last_modified", { mode: 'string' }).default(sql`(now())`).notNull(),
	modified_by_id: varchar("modified_by_id", { length: 128 }).references(() => users.id),
	is_deleted: tinyint("is_deleted").default(0).notNull(),
},
(table) => {
	return {
		timetable_idx: index("timetable_idx").on(table.timetable_id),
		carousels_id: primaryKey({ columns: [table.id], name: "carousels_id"}),
	}
});

export const events = mysqlTable("events", {
	id: varchar("id", { length: 128 }).notNull(),
	name: varchar("name", { length: 128 }),
	staff: varchar("staff", { length: 128 }),
	module_code: varchar("module_code", { length: 20 }),
	timetable_id: varchar("timetable_id", { length: 128 }).references(() => timetables.id),
	type: mysqlEnum("type", ['OTHER','WORKSHOP','LECTURE','SOCIAL','MAINTENANCE','EXAM','PROJECT']).default('OTHER').notNull(),
	colour: varchar("colour", { length: 7 }),
	start: timestamp("start", { mode: 'string' }).notNull(),
	end: timestamp("end", { mode: 'string' }).notNull(),
	last_modified: timestamp("last_modified", { mode: 'string' }).default(sql`(now())`).notNull(),
	modified_by_id: varchar("modified_by_id", { length: 128 }).references(() => users.id),
	is_combined_session: tinyint("is_combined_session").default(0),
	group: varchar("group", { length: 10 }),
	external_id: varchar("external_id", { length: 128 }),
},
(table) => {
	return {
		timetable_idx: index("timetable_idx").on(table.timetable_id),
		start_idx: index("start_idx").on(table.start),
		end_idx: index("end_idx").on(table.end),
		external_idx: index("external_idx").on(table.external_id),
		events_id: primaryKey({ columns: [table.id], name: "events_id"}),
	}
});

export const logs = mysqlTable("logs", {
	id: varchar("id", { length: 128 }).notNull(),
	user: varchar("user", { length: 128 }).references(() => users.id),
	message: text("message").notNull(),
	time: timestamp("time", { mode: 'string' }).default(sql`(now())`).notNull(),
},
(table) => {
	return {
		user_idx: index("user_idx").on(table.user),
		logs_id: primaryKey({ columns: [table.id], name: "logs_id"}),
	}
});

export const timetable_group_members = mysqlTable("timetable_group_members", {
	group_id: varchar("group_id", { length: 128 }).references(() => timetable_groups.id),
	timetable_id: varchar("timetable_id", { length: 128 }).references(() => timetables.id),
	order: int("order").default(0),
	location: mysqlEnum("location", ['UPSTAIRS','DOWNSTAIRS','LEFT','RIGHT','FORWARD','BACKWARD']),
},
(table) => {
	return {
		timetable_idx: index("timetable_idx").on(table.timetable_id),
		group_idx: index("group_idx").on(table.group_id),
	}
});

export const timetable_groups = mysqlTable("timetable_groups", {
	id: varchar("id", { length: 128 }).notNull(),
	internal_name: varchar("internal_name", { length: 128 }).notNull(),
	name: varchar("name", { length: 128 }).notNull(),
	subtitle: varchar("subtitle", { length: 128 }).notNull(),
	last_modified: timestamp("last_modified", { mode: 'string' }).default(sql`(now())`).notNull(),
	modified_by_id: varchar("modified_by_id", { length: 128 }).references(() => users.id),
	is_deleted: tinyint("is_deleted").default(0),
	display_info_pane: tinyint("display_info_pane").default(0),
	info_pane_text: text("info_pane_text"),
	display_info_pane_qr: tinyint("display_info_pane_qr").default(0),
	info_pane_qr_url: varchar("info_pane_qr_url", { length: 256 }),
	object: varchar("object", { length: 30 }).default('room').notNull(),
	verb_available: varchar("verb_available", { length: 30 }).default('free').notNull(),
	verb_unavailable: varchar("verb_unavailable", { length: 30 }).default('in use').notNull(),
},
(table) => {
	return {
		timetable_groups_id: primaryKey({ columns: [table.id], name: "timetable_groups_id"}),
	}
});

export const timetables = mysqlTable("timetables", {
	id: varchar("id", { length: 128 }).notNull(),
	space_code: varchar("space_code", { length: 10 }).notNull(),
	name: varchar("name", { length: 256 }).notNull(),
	creation_date: timestamp("creation_date", { mode: 'string' }).default(sql`(now())`).notNull(),
	capacity: int("capacity"),
	can_combine: tinyint("can_combine").default(0).notNull(),
	combined_partner_id: varchar("combined_partner_id", { length: 128 }),
	is_deleted: tinyint("is_deleted").default(0).notNull(),
	data_source: mysqlEnum("data_source", ['MANUAL','UOL_TIMETABLE','ICAL','MS_BOOKINGS']).default('MANUAL').notNull(),
},
(table) => {
	return {
		timetables_id: primaryKey({ columns: [table.id], name: "timetables_id"}),
		space_code_idx: unique("space_code_idx").on(table.space_code),
	}
});

export const users = mysqlTable("users", {
	id: varchar("id", { length: 128 }).notNull(),
	username: varchar("username", { length: 50 }).notNull(),
	short_name: varchar("short_name", { length: 50 }).notNull(),
	full_name: varchar("full_name", { length: 256 }).notNull(),
	initials: varchar("initials", { length: 3 }).notNull(),
	role: mysqlEnum("role", ['TECHNICIAN','STANDARD']).default('STANDARD').notNull(),
	email: varchar("email", { length: 256 }).notNull(),
	password: char("password", { length: 60 }),
	creation_date: timestamp("creation_date", { mode: 'string' }).default(sql`(now())`).notNull(),
	reset_token: char("reset_token", { length: 8 }),
	reset_token_expiry: timestamp("reset_token_expiry", { mode: 'string' }),
	profile_picture_url: varchar("profile_picture_url", { length: 256 }),
	is_deleted: tinyint("is_deleted").default(0).notNull(),
},
(table) => {
	return {
		users_id: primaryKey({ columns: [table.id], name: "users_id"}),
		email_idx: unique("email_idx").on(table.email),
		username_idx: unique("username_idx").on(table.username),
	}
});