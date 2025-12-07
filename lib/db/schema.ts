import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'pi', 'researcher', 'viewer']);
export const experimentStatusEnum = pgEnum('experiment_status', ['draft', 'in-progress', 'review', 'rejected', 'completed', 'locked']);
export const spectrumTypeEnum = pgEnum('spectrum_type', ['IR', 'NMR', 'MS', 'UV-Vis', 'other']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  boxUserId: varchar('box_user_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  role: userRoleEnum('role').default('researcher').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Projects table (cache of Box folder metadata)
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  boxFolderId: varchar('box_folder_id', { length: 255 }).notNull().unique(),
  projectCode: varchar('project_code', { length: 50 }).notNull(),
  projectName: varchar('project_name', { length: 255 }).notNull(),
  description: text('description'),
  piName: varchar('pi_name', { length: 255 }),
  piEmail: varchar('pi_email', { length: 255 }),
  department: varchar('department', { length: 255 }),
  status: varchar('status', { length: 50 }).default('planning'),
  createdById: uuid('created_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Experiments table
export const experiments = pgTable('experiments', {
  id: uuid('id').defaultRandom().primaryKey(),
  boxFolderId: varchar('box_folder_id', { length: 255 }).notNull().unique(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  experimentId: varchar('experiment_id', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  objective: text('objective'),
  hypothesis: text('hypothesis'),
  status: experimentStatusEnum('status').default('draft').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Protocol steps table
export const protocolSteps = pgTable('protocol_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  stepNumber: integer('step_number').notNull(),
  instruction: text('instruction').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reagents table
export const reagents = pgTable('reagents', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 4 }),
  unit: varchar('unit', { length: 20 }),
  molarAmount: decimal('molar_amount', { precision: 10, scale: 6 }),
  molarUnit: varchar('molar_unit', { length: 20 }).default('mol'),
  observations: text('observations'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Yields table
export const yields = pgTable('yields', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  productName: varchar('product_name', { length: 255 }),
  theoretical: decimal('theoretical', { precision: 10, scale: 4 }),
  actual: decimal('actual', { precision: 10, scale: 4 }),
  percentage: decimal('percentage', { precision: 5, scale: 2 }),
  unit: varchar('unit', { length: 20 }).default('g'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Spectra table
export const spectra = pgTable('spectra', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  boxFileId: varchar('box_file_id', { length: 255 }),
  spectrumType: spectrumTypeEnum('spectrum_type').notNull(),
  title: varchar('title', { length: 255 }),
  caption: text('caption'),
  peakData: jsonb('peak_data'), // Store key peaks as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit log table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(), // create, update, delete, sign, etc.
  entityType: varchar('entity_type', { length: 50 }).notNull(), // project, experiment, entry
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  details: jsonb('details'), // Additional action details
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Protocol snapshots table
export const protocolSnapshots = pgTable('protocol_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  snapshotData: jsonb('snapshot_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  link: varchar('link', { length: 500 }), // Action link (e.g. /experiments/123)
  read: integer('read').default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Files cache table (optional - caches Box file metadata)
export const filesCache = pgTable('files_cache', {
  id: uuid('id').defaultRandom().primaryKey(),
  boxFileId: varchar('box_file_id', { length: 255 }).notNull().unique(),
  experimentId: uuid('experiment_id').references(() => experiments.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 100 }),
  fileSize: integer('file_size'),
  boxFolderId: varchar('box_folder_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  experiments: many(experiments),
  auditLogs: many(auditLog),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
  experiments: many(experiments),
}));

export const experimentsRelations = relations(experiments, ({ one, many }) => ({
  project: one(projects, {
    fields: [experiments.projectId],
    references: [projects.id],
  }),
  author: one(users, {
    fields: [experiments.authorId],
    references: [users.id],
  }),
  protocolSteps: many(protocolSteps),
  reagents: many(reagents),
  yields: many(yields),
  spectra: many(spectra),
  files: many(filesCache),
}));

export const protocolStepsRelations = relations(protocolSteps, ({ one }) => ({
  experiment: one(experiments, {
    fields: [protocolSteps.experimentId],
    references: [experiments.id],
  }),
}));

export const reagentsRelations = relations(reagents, ({ one }) => ({
  experiment: one(experiments, {
    fields: [reagents.experimentId],
    references: [experiments.id],
  }),
}));

export const yieldsRelations = relations(yields, ({ one }) => ({
  experiment: one(experiments, {
    fields: [yields.experimentId],
    references: [experiments.id],
  }),
}));

export const spectraRelations = relations(spectra, ({ one }) => ({
  experiment: one(experiments, {
    fields: [spectra.experimentId],
    references: [experiments.id],
  }),
}));

export const filesCacheRelations = relations(filesCache, ({ one }) => ({
  experiment: one(experiments, {
    fields: [filesCache.experimentId],
    references: [experiments.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

export const protocolSnapshotsRelations = relations(protocolSnapshots, ({ one }) => ({
  experiment: one(experiments, {
    fields: [protocolSnapshots.experimentId],
    references: [experiments.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;
export type ProtocolStep = typeof protocolSteps.$inferSelect;
export type NewProtocolStep = typeof protocolSteps.$inferInsert;
export type Reagent = typeof reagents.$inferSelect;
export type NewReagent = typeof reagents.$inferInsert;
export type Yield = typeof yields.$inferSelect;
export type NewYield = typeof yields.$inferInsert;
export type Spectrum = typeof spectra.$inferSelect;
export type NewSpectrum = typeof spectra.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
