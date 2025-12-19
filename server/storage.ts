import {
  projects,
  milestones,
  tasks,
  messages,
  previews,
  files,
  activityLog,
  invoices,
  memberRoles,
  teamAssignments,
  subscriptions,
  type Project,
  type InsertProject,
  type Milestone,
  type InsertMilestone,
  type Task,
  type InsertTask,
  type Message,
  type InsertMessage,
  type Preview,
  type InsertPreview,
  type FileRecord,
  type InsertFile,
  type ActivityLogEntry,
  type InsertActivityLog,
  type Invoice,
  type InsertInvoice,
  type MemberRole,
  type InsertMemberRole,
  type TeamAssignment,
  type InsertTeamAssignment,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Member Roles
  getMemberRole(userId: string): Promise<MemberRole | undefined>;
  upsertMemberRole(data: InsertMemberRole): Promise<MemberRole>;
  
  // Projects
  getProjectsByClient(clientMemberId: string): Promise<Project[]>;
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectForClient(id: string, clientMemberId: string): Promise<Project | undefined>;
  createProject(data: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Milestones
  getMilestonesByProject(projectId: string): Promise<Milestone[]>;
  createMilestone(data: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  
  // Tasks
  getTasksByProject(projectId: string): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  
  // Messages
  getMessagesByProject(projectId: string): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  
  // Previews
  getPreviewsByProject(projectId: string): Promise<Preview[]>;
  createPreview(data: InsertPreview): Promise<Preview>;
  updatePreview(id: string, data: Partial<InsertPreview>): Promise<Preview | undefined>;
  
  // Files
  getFilesByProject(projectId: string): Promise<FileRecord[]>;
  createFile(data: InsertFile): Promise<FileRecord>;
  deleteFile(id: string): Promise<void>;
  
  // Activity Log
  getActivityByProject(projectId: string): Promise<ActivityLogEntry[]>;
  logActivity(data: InsertActivityLog): Promise<ActivityLogEntry>;
  
  // Invoices
  getInvoicesByProject(projectId: string): Promise<Invoice[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  
  // Team Assignments
  getTeamByProject(projectId: string): Promise<TeamAssignment[]>;
  assignTeamMember(data: InsertTeamAssignment): Promise<TeamAssignment>;
  removeTeamMember(id: string): Promise<void>;
  
  // Subscriptions
  createSubscription(data: InsertSubscription): Promise<Subscription>;
}

export class DatabaseStorage implements IStorage {
  // Member Roles
  async getMemberRole(userId: string): Promise<MemberRole | undefined> {
    const [role] = await db.select().from(memberRoles).where(eq(memberRoles.userId, userId));
    return role;
  }

  async upsertMemberRole(data: InsertMemberRole): Promise<MemberRole> {
    const [role] = await db
      .insert(memberRoles)
      .values(data)
      .onConflictDoUpdate({
        target: memberRoles.userId,
        set: { role: data.role },
      })
      .returning();
    return role;
  }

  // Projects
  async getProjectsByClient(clientMemberId: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.clientMemberId, clientMemberId)).orderBy(desc(projects.createdAt));
  }

  async getAllProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectForClient(id: string, clientMemberId: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.clientMemberId, clientMemberId)));
    return project;
  }

  async createProject(data: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(data).returning();
    return project;
  }

  async updateProject(id: string, data: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Milestones
  async getMilestonesByProject(projectId: string): Promise<Milestone[]> {
    return db.select().from(milestones).where(eq(milestones.projectId, projectId)).orderBy(milestones.order);
  }

  async createMilestone(data: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db.insert(milestones).values(data).returning();
    return milestone;
  }

  async updateMilestone(id: string, data: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [milestone] = await db.update(milestones).set(data).where(eq(milestones.id, id)).returning();
    return milestone;
  }

  // Tasks
  async getTasksByProject(projectId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning();
    return task;
  }

  // Messages
  async getMessagesByProject(projectId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.projectId, projectId)).orderBy(messages.createdAt);
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(data).returning();
    return message;
  }

  // Previews
  async getPreviewsByProject(projectId: string): Promise<Preview[]> {
    return db.select().from(previews).where(eq(previews.projectId, projectId)).orderBy(desc(previews.createdAt));
  }

  async createPreview(data: InsertPreview): Promise<Preview> {
    const [preview] = await db.insert(previews).values(data).returning();
    return preview;
  }

  async updatePreview(id: string, data: Partial<InsertPreview>): Promise<Preview | undefined> {
    const [preview] = await db.update(previews).set({ ...data, updatedAt: new Date() }).where(eq(previews.id, id)).returning();
    return preview;
  }

  // Files
  async getFilesByProject(projectId: string): Promise<FileRecord[]> {
    return db.select().from(files).where(eq(files.projectId, projectId)).orderBy(desc(files.createdAt));
  }

  async createFile(data: InsertFile): Promise<FileRecord> {
    const [file] = await db.insert(files).values(data).returning();
    return file;
  }

  async deleteFile(id: string): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  // Activity Log
  async getActivityByProject(projectId: string): Promise<ActivityLogEntry[]> {
    return db.select().from(activityLog).where(eq(activityLog.projectId, projectId)).orderBy(desc(activityLog.createdAt));
  }

  async logActivity(data: InsertActivityLog): Promise<ActivityLogEntry> {
    const [entry] = await db.insert(activityLog).values(data).returning();
    return entry;
  }

  // Invoices
  async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.projectId, projectId)).orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(data).returning();
    return invoice;
  }

  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  // Team Assignments
  async getTeamByProject(projectId: string): Promise<TeamAssignment[]> {
    return db.select().from(teamAssignments).where(eq(teamAssignments.projectId, projectId));
  }

  async assignTeamMember(data: InsertTeamAssignment): Promise<TeamAssignment> {
    const [assignment] = await db.insert(teamAssignments).values(data).returning();
    return assignment;
  }

  async removeTeamMember(id: string): Promise<void> {
    await db.delete(teamAssignments).where(eq(teamAssignments.id, id));
  }

  // Subscriptions
  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(data).returning();
    return subscription;
  }
}

export const storage = new DatabaseStorage();
