import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { insertProjectSchema, insertMilestoneSchema, insertMessageSchema, insertPreviewSchema, insertFileSchema, insertSubscriptionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get current user ID
  const getUserId = (req: any): string | null => {
    return req.user?.claims?.sub || null;
  };

  // Helper to check if user is staff
  const isStaff = async (userId: string): Promise<boolean> => {
    const role = await storage.getMemberRole(userId);
    return role ? role.role !== "client" : false;
  };

  // Member Role endpoint
  app.get("/api/member-role", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      let role = await storage.getMemberRole(userId);
      if (!role) {
        // Create default client role
        role = await storage.upsertMemberRole({ userId, role: "client" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching member role:", error);
      res.status(500).json({ message: "Failed to fetch member role" });
    }
  });

  // Claim demo projects (for testing)
  app.post("/api/claim-demo-projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Update demo projects to be owned by this user
      const result = await storage.claimDemoProjects("demo-client-001", userId);
      res.json({ message: "Demo projects claimed", count: result });
    } catch (error) {
      console.error("Error claiming demo projects:", error);
      res.status(500).json({ message: "Failed to claim demo projects" });
    }
  });

  // CLIENT PORTAL ROUTES

  // Get client's projects
  app.get("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const projects = await storage.getProjectsByClient(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get single project (client access check)
  app.get("/api/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Get project milestones
  app.get("/api/projects/:id/milestones", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      // Verify access
      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const milestones = await storage.getMilestonesByProject(id);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  // Get project previews
  app.get("/api/projects/:id/previews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const previews = await storage.getPreviewsByProject(id);
      res.json(previews);
    } catch (error) {
      console.error("Error fetching previews:", error);
      res.status(500).json({ message: "Failed to fetch previews" });
    }
  });

  // Get project messages
  app.get("/api/projects/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const messages = await storage.getMessagesByProject(id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post("/api/projects/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const memberRole = await storage.getMemberRole(userId);
      const data = insertMessageSchema.parse({
        ...req.body,
        projectId: id,
        senderMemberId: userId,
        senderRole: memberRole?.role || "client",
      });

      const message = await storage.createMessage(data);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get project files
  app.get("/api/projects/:id/files", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const files = await storage.getFilesByProject(id);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  // Get project invoices
  app.get("/api/projects/:id/invoices", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { id } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(id)
        : await storage.getProjectForClient(id, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const invoices = await storage.getInvoicesByProject(id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // ADMIN ROUTES

  // Get all projects (staff only)
  app.get("/api/admin/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userIsStaff = await isStaff(userId);
      if (!userIsStaff) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching all projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Create project (staff only)
  app.post("/api/admin/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userIsStaff = await isStaff(userId);
      if (!userIsStaff) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);

      // Log activity
      await storage.logActivity({
        projectId: project.id,
        eventType: "project_created",
        description: `Project "${project.title}" was created`,
        actorMemberId: userId,
      });

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update project (staff only)
  app.patch("/api/admin/projects/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userIsStaff = await isStaff(userId);
      if (!userIsStaff) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const project = await storage.updateProject(id, req.body);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      await storage.logActivity({
        projectId: id,
        eventType: "project_updated",
        description: `Project was updated`,
        actorMemberId: userId,
      });

      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Create milestone (staff only)
  app.post("/api/admin/projects/:id/milestones", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userIsStaff = await isStaff(userId);
      if (!userIsStaff) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const data = insertMilestoneSchema.parse({ ...req.body, projectId: id });
      const milestone = await storage.createMilestone(data);

      await storage.logActivity({
        projectId: id,
        eventType: "milestone_created",
        description: `Milestone "${milestone.name}" was created`,
        actorMemberId: userId,
      });

      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  // Create preview (staff only)
  app.post("/api/admin/projects/:id/previews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const userIsStaff = await isStaff(userId);
      if (!userIsStaff) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { id } = req.params;
      const data = insertPreviewSchema.parse({ ...req.body, projectId: id });
      const preview = await storage.createPreview(data);

      await storage.logActivity({
        projectId: id,
        eventType: "preview_created",
        description: `New preview "${preview.label}" (${preview.version}) was posted`,
        actorMemberId: userId,
      });

      res.json(preview);
    } catch (error) {
      console.error("Error creating preview:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create preview" });
    }
  });

  // Update preview status (both client and staff)
  app.patch("/api/projects/:projectId/previews/:previewId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { projectId, previewId } = req.params;
      const userIsStaff = await isStaff(userId);

      const project = userIsStaff
        ? await storage.getProject(projectId)
        : await storage.getProjectForClient(projectId, userId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const { status, feedback } = req.body;
      const preview = await storage.updatePreview(previewId, { status, feedback });

      if (!preview) {
        return res.status(404).json({ message: "Preview not found" });
      }

      await storage.logActivity({
        projectId,
        eventType: "preview_status_changed",
        description: `Preview "${preview.label}" status changed to ${status}`,
        actorMemberId: userId,
      });

      res.json(preview);
    } catch (error) {
      console.error("Error updating preview:", error);
      res.status(500).json({ message: "Failed to update preview" });
    }
  });

  // PUBLIC ROUTES (no auth required)
  
  // Create subscription (for HIVE SITE interest)
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  return httpServer;
}
