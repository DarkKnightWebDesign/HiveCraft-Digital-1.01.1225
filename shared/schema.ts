import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Enums
export const projectTypeEnum = pgEnum("project_type", ["managed_website", "custom_website", "online_store", "web_app"]);
export const projectTierEnum = pgEnum("project_tier", ["launch", "growth", "scale"]);
export const projectStatusEnum = pgEnum("project_status", ["discovery", "design", "build", "launch", "care", "completed", "on_hold"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "in_progress", "awaiting_approval", "approved", "completed"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "blocked"]);
export const previewStatusEnum = pgEnum("preview_status", ["draft", "ready", "approved", "rejected", "revision_requested"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "overdue", "cancelled"]);
export const memberRoleEnum = pgEnum("member_role", ["client", "admin", "project_manager", "designer", "developer", "editor", "billing"]);

// Member Roles - extends user with role information
export const memberRoles = pgTable("member_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(), // Add unique constraint
  role: memberRoleEnum("role").notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientMemberId: varchar("client_member_id").notNull(),
  title: text("title").notNull(),
  type: projectTypeEnum("type").notNull(),
  tier: projectTierEnum("tier").notNull(),
  status: projectStatusEnum("status").notNull().default("discovery"),
  startDate: timestamp("start_date"),
  targetLaunchDate: timestamp("target_launch_date"),
  progressPercent: integer("progress_percent").notNull().default(0),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Milestones
export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: milestoneStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  order: integer("order").notNull().default(0),
  approvalRequired: boolean("approval_required").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  milestoneId: varchar("milestone_id"),
  title: text("title").notNull(),
  description: text("description"),
  assigneeRole: memberRoleEnum("assignee_role"),
  assigneeUserId: varchar("assignee_user_id"),
  status: taskStatusEnum("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  senderMemberId: varchar("sender_member_id").notNull(),
  senderRole: memberRoleEnum("sender_role").notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Previews
export const previews = pgTable("previews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  url: text("url").notNull(),
  label: text("label").notNull(),
  notes: text("notes"),
  version: text("version").notNull().default("v1.0"),
  status: previewStatusEnum("status").notNull().default("draft"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Files
export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  milestoneId: varchar("milestone_id"), // Optional link to milestone
  uploadedByMemberId: varchar("uploaded_by_member_id").notNull(),
  fileUrl: text("file_url").notNull(),
  blobName: text("blob_name").notNull(), // Azure blob storage reference
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size"),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Log
export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  actorMemberId: varchar("actor_member_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: integer("amount").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date"),
  paidDate: timestamp("paid_date"),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Team Assignments
export const teamAssignments = pgTable("team_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: memberRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscriptions (for HIVE SITE interest)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  milestones: many(milestones),
  tasks: many(tasks),
  messages: many(messages),
  previews: many(previews),
  files: many(files),
  activityLog: many(activityLog),
  invoices: many(invoices),
  teamAssignments: many(teamAssignments),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  milestone: one(milestones, { fields: [tasks.milestoneId], references: [milestones.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, { fields: [messages.projectId], references: [projects.id] }),
}));

export const previewsRelations = relations(previews, ({ one }) => ({
  project: one(projects, { fields: [previews.projectId], references: [projects.id] }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  project: one(projects, { fields: [files.projectId], references: [projects.id] }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, { fields: [activityLog.projectId], references: [projects.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  project: one(projects, { fields: [invoices.projectId], references: [projects.id] }),
}));

export const teamAssignmentsRelations = relations(teamAssignments, ({ one }) => ({
  project: one(projects, { fields: [teamAssignments.projectId], references: [projects.id] }),
}));

// Insert Schemas
export const insertMemberRoleSchema = createInsertSchema(memberRoles).omit({ id: true, createdAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertPreviewSchema = createInsertSchema(previews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFileSchema = createInsertSchema(files).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export const insertTeamAssignmentSchema = createInsertSchema(teamAssignments).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });

// Types
export type MemberRole = typeof memberRoles.$inferSelect;
export type InsertMemberRole = z.infer<typeof insertMemberRoleSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Preview = typeof previews.$inferSelect;
export type InsertPreview = z.infer<typeof insertPreviewSchema>;
export type FileRecord = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type TeamAssignment = typeof teamAssignments.$inferSelect;
export type InsertTeamAssignment = z.infer<typeof insertTeamAssignmentSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
