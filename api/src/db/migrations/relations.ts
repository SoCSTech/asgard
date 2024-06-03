import { relations } from "drizzle-orm/relations";
import { carousels, carousel_items, users, timetables, events, logs, timetable_groups, timetable_group_members } from "./schema";

export const carousel_itemsRelations = relations(carousel_items, ({one}) => ({
	carousel: one(carousels, {
		fields: [carousel_items.carousel_id],
		references: [carousels.id]
	}),
	user: one(users, {
		fields: [carousel_items.modified_by_id],
		references: [users.id]
	}),
}));

export const carouselsRelations = relations(carousels, ({one, many}) => ({
	carousel_items: many(carousel_items),
	user: one(users, {
		fields: [carousels.modified_by_id],
		references: [users.id]
	}),
	timetable: one(timetables, {
		fields: [carousels.timetable_id],
		references: [timetables.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	carousel_items: many(carousel_items),
	carousels: many(carousels),
	events: many(events),
	logs: many(logs),
	timetable_groups: many(timetable_groups),
}));

export const timetablesRelations = relations(timetables, ({many}) => ({
	carousels: many(carousels),
	events: many(events),
	timetable_group_members: many(timetable_group_members),
}));

export const eventsRelations = relations(events, ({one}) => ({
	user: one(users, {
		fields: [events.modified_by_id],
		references: [users.id]
	}),
	timetable: one(timetables, {
		fields: [events.timetable_id],
		references: [timetables.id]
	}),
}));

export const logsRelations = relations(logs, ({one}) => ({
	user: one(users, {
		fields: [logs.user],
		references: [users.id]
	}),
}));

export const timetable_group_membersRelations = relations(timetable_group_members, ({one}) => ({
	timetable_group: one(timetable_groups, {
		fields: [timetable_group_members.group_id],
		references: [timetable_groups.id]
	}),
	timetable: one(timetables, {
		fields: [timetable_group_members.timetable_id],
		references: [timetables.id]
	}),
}));

export const timetable_groupsRelations = relations(timetable_groups, ({one, many}) => ({
	timetable_group_members: many(timetable_group_members),
	user: one(users, {
		fields: [timetable_groups.modified_by_id],
		references: [users.id]
	}),
}));