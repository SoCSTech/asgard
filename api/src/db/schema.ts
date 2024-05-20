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
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { duration } from 'moment';

export const logs = mysqlTable('logs', {
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
    user: varchar('user', { length: 128 }).references(() => users.id),
    message: text('message').notNull(),
    time: timestamp('time').defaultNow().notNull()
});

export const users = mysqlTable('users', {
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
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
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
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
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
    name: varchar('name', { length: 128 }),
    staff: varchar('staff', { length: 128 }),
    moduleCode: varchar('module_code', { length: 20 }),
    timetableId: varchar('timetable_id', { length: 128 }).references(() => timetables.id),
    type: mysqlEnum('type', ['OTHER', 'WORKSHOP', 'LECTURE', 'SOCIAL', 'MAINTENANCE', 'EXAM', 'PROJECT']).default('OTHER').notNull(),
    colour: varchar('colour', {length: 7}),
    start: timestamp('start', { mode: "string" }).notNull(),
    end: timestamp('end', { mode: "string" }).notNull(),
    lastModified: timestamp('last_modified', { mode: "string" }).defaultNow().notNull(),
    modifiedBy: varchar('modified_by_id', { length: 128 }).references(() => users.id),
    isCombinedSession: boolean('is_combined_session').default(false),
    group: varchar('group', { length: 10 }),
})

export const carousels = mysqlTable('carousels', {
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
    timetable: varchar('timetable_id', {length: 128}).references(() => timetables.id),
    lastModified: timestamp('last_modified', { mode: "string" }).defaultNow().notNull(),
    modifiedBy: varchar('modified_by_id', { length: 128 }).references(() => users.id),
    isDeleted: boolean('is_deleted').default(false).notNull(),
})

export const carouselItems = mysqlTable('carousel_items', {
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
    carousel: varchar('carousel_id', { length: 128 }).references(() => carousels.id),
    lastModified: timestamp('last_modified', { mode: "string" }).defaultNow().notNull(),
    modifiedBy: varchar('modified_by_id', { length: 128 }).references(() => users.id),
    type: mysqlEnum('type', ['TIMETABLE', 'PICTURE', 'VIDEO', 'WEB']).default('TIMETABLE').notNull(),
    contentUrl: varchar('content_url', { length: 2000 }),
    name: varchar('name', { length: 128 }).notNull(),
    isDeleted: boolean('is_deleted').default(false).notNull(),
    durationMs: int('duration_milliseconds').default(4500).notNull(),
    order: int('order').default(0)
})

export const timetableGroups = mysqlTable('timetable_groups', {
    id: varchar('id', { length: 128 }).$defaultFn(() => createId()).primaryKey(),
    internalName: varchar('internal_name', { length: 128 }).notNull(),
    name: varchar('name', { length: 128 }).notNull(),
    subtitle: varchar('subtitle', { length: 128 }).notNull(),
    lastModified: timestamp('last_modified', { mode: "string" }).defaultNow().notNull(),
    modifiedBy: varchar('modified_by_id', { length: 128 }).references(() => users.id),
    isDeleted: boolean('is_deleted').default(false),
    displayInfoPane: boolean('display_info_pane').default(false),
    infoPaneText: text('info_pane_text'),
    infoPaneQR: boolean('info_pane_qr').default(false),
    infoPaneQRUrl: varchar('info_pane_qr_url', { length: 256 }),
})

export const timetableGroupMembers = mysqlTable('timetable_group_members', {
    groupId: varchar('group_id', { length: 128 }).references(() => timetableGroups.id),
    timetableId: varchar('timetable_id', { length: 128 }).references(() => timetables.id),
})