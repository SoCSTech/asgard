import {
    uniqueIndex,
    boolean,
    varchar,
    char,
    text,
    timestamp,
    int,
    decimal,
    mysqlTable,
    mysqlEnum,
    datetime
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
const short = require('short-uuid');

export const users = mysqlTable('users', {
    id: varchar('id', { length: 128 }).$defaultFn(() => short.uuid()).primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    shortName: varchar('short_name', { length: 50 }).notNull(),
    fullName: varchar('full_name', { length: 256 }).notNull(),
    initials: varchar('initials', { length: 3 }).notNull(),
    role: mysqlEnum('role', ['TECHNICIAN', 'STANDARD']).default('STANDARD').notNull(),
    email: varchar('email', { length: 256 }).notNull(),
    password: char('password', { length: 60 }),
    creationDate: timestamp('creation_date').defaultNow().notNull(),
    resetToken: char('reset_token', { length: 8 }),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    profilePictureUrl: varchar('profile_picture_url', { length: 256 }),
    isDeleted: boolean('is_deleted').default(false).notNull()
}, (users) => ({
    emailIndex: uniqueIndex('email_idx').on(users.email),
    usernameIndex: uniqueIndex('username_idx').on(users.username),
}));

export const timetables = mysqlTable('timetables', {
    id: varchar('id', { length: 128 }).$defaultFn(() => short.uuid()).primaryKey(),
    spaceCode: varchar('space_code', { length: 10 }).notNull(),
    name: varchar('name', { length: 256 }).notNull(),
    creationDate: timestamp('creation_date').defaultNow().notNull(),
    capacity: int('capacity'),
    canCombine: boolean('can_combine').default(false).notNull(),
    combinedPartnerId: varchar('combined_partner_id', { length: 128 }),
    isDeleted: boolean('is_deleted').default(false).notNull()
}, (timetables) => ({
    spaceCodeIndex: uniqueIndex('space_code_idx').on(timetables.spaceCode)
}));

export const timetablesRelations = relations(timetables, ({ one, many }) => ({
    combinedPartner: one(timetables, {
        fields: [timetables.combinedPartnerId],
        references: [timetables.id]
    }),
    events: many(events)
}))

export const events = mysqlTable('events', {
    id: varchar('id', { length: 128 }).$defaultFn(() => short.uuid()).primaryKey(),
    name: varchar('name', { length: 128 }),
    staff: varchar('staff', { length: 128 }),
    moduleCode: varchar('module_code', { length: 20 }),
    timetableId: varchar('timetable_id', { length: 128 }).references(() => timetables.id),
    type: mysqlEnum('type', ['OTHER', 'WORKSHOP', 'LECTURE', 'SOCIAL', 'MAINTENANCE', 'EXAM', 'PROJECT']).default('OTHER').notNull(),
    colour: varchar('colour', {length: 7}),
    start: datetime('start', { mode: 'date' || "string" }).notNull(),
    end: datetime('end', { mode: 'date' || "string" }).notNull(),
    lastModified: datetime('last_modified', { mode: 'date' || "string" }).notNull(),
    modifiedBy: varchar('modified_by_id', { length: 128 }).references(() => users.id),
    isCombinedSession: boolean('is_combined_session').default(false),
})