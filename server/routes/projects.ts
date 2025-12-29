import { Router } from 'express';
import multer from 'multer';
import { db } from '../db';
import { projects, milestones, files, messages, activityLog } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { uploadFile, deleteFile } from '../storage/azure-blob';

const router = Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'video/mp4', 'video/quicktime',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, documents, and videos are allowed.'));
    }
  },
});

// Helper to check project access
async function canAccessProject(userId: string, projectId: string, userRole: string): Promise<boolean> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return false;

  // Admin and staff can access all projects
  if (['admin', 'project_manager', 'designer', 'developer'].includes(userRole)) {
    return true;
  }

  // Clients can only access their own projects
  return project.clientMemberId === userId;
}

// GET /api/projects - List all projects (filtered by role)
router.get('/', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role || 'client';

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let projectsList;

    if (['admin', 'project_manager', 'designer', 'developer'].includes(userRole)) {
      // Staff sees all projects
      projectsList = await db.query.projects.findMany({
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        with: {
          milestones: true,
        },
      });
    } else {
      // Clients see only their projects
      projectsList = await db.query.projects.findMany({
        where: eq(projects.clientMemberId, userId),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        with: {
          milestones: true,
        },
      });
    }

    res.json(projectsList);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role || 'client';
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = await canAccessProject(userId, id, userRole);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        milestones: {
          orderBy: (milestones, { asc }) => [asc(milestones.order)],
        },
        files: {
          orderBy: (files, { desc }) => [desc(files.createdAt)],
        },
        messages: {
          orderBy: (messages, { desc }) => [desc(messages.createdAt)],
          limit: 50,
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project (admin only)
router.post('/', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role;

    if (!userId || !['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { clientMemberId, title, type, tier, summary, startDate, targetLaunchDate } = req.body;

    if (!clientMemberId || !title || !type || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [newProject] = await db.insert(projects).values({
      clientMemberId,
      title,
      type,
      tier,
      summary,
      startDate: startDate ? new Date(startDate) : null,
      targetLaunchDate: targetLaunchDate ? new Date(targetLaunchDate) : null,
      status: 'discovery',
      progressPercent: 0,
    }).returning();

    // Log activity
    await db.insert(activityLog).values({
      projectId: newProject.id,
      eventType: 'project_created',
      description: `Project "${title}" created`,
      actorMemberId: userId,
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PATCH /api/projects/:id - Update project
router.patch('/:id', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role;
    const { id } = req.params;

    if (!userId || !['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, type, tier, status, summary, startDate, targetLaunchDate, progressPercent } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (title) updates.title = title;
    if (type) updates.type = type;
    if (tier) updates.tier = tier;
    if (status) updates.status = status;
    if (summary !== undefined) updates.summary = summary;
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
    if (targetLaunchDate !== undefined) updates.targetLaunchDate = targetLaunchDate ? new Date(targetLaunchDate) : null;
    if (progressPercent !== undefined) updates.progressPercent = progressPercent;

    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Log activity
    await db.insert(activityLog).values({
      projectId: id,
      eventType: 'project_updated',
      description: `Project updated`,
      actorMemberId: userId,
      metadata: updates,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role;
    const { id } = req.params;

    if (!userId || userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Delete associated files from blob storage
    const projectFiles = await db.query.files.findMany({
      where: eq(files.projectId, id),
    });

    for (const file of projectFiles) {
      try {
        await deleteFile(file.blobName);
      } catch (err) {
        console.error(`Failed to delete blob ${file.blobName}:`, err);
      }
    }

    // Database cascades will handle related records
    await db.delete(projects).where(eq(projects.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/milestones - Create milestone
router.post('/:id/milestones', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role;
    const { id: projectId } = req.params;

    if (!userId || !['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, dueDate, order, approvalRequired } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Milestone name required' });
    }

    const [newMilestone] = await db.insert(milestones).values({
      projectId,
      name,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: order || 0,
      approvalRequired: approvalRequired || false,
      status: 'pending',
    }).returning();

    // Log activity
    await db.insert(activityLog).values({
      projectId,
      eventType: 'milestone_created',
      description: `Milestone "${name}" created`,
      actorMemberId: userId,
    });

    res.status(201).json(newMilestone);
  } catch (error) {
    console.error('Error creating milestone:', error);
    res.status(500).json({ error: 'Failed to create milestone' });
  }
});

// PATCH /api/projects/:id/milestones/:milestoneId - Update milestone
router.patch('/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role;
    const { id: projectId, milestoneId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = await canAccessProject(userId, projectId, userRole);
    if (!hasAccess && !['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, status, dueDate, order, approvalRequired } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) updates.order = order;
    if (approvalRequired !== undefined) updates.approvalRequired = approvalRequired;

    const [updated] = await db.update(milestones)
      .set(updates)
      .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // Log activity
    await db.insert(activityLog).values({
      projectId,
      eventType: 'milestone_updated',
      description: `Milestone "${updated.name}" updated`,
      actorMemberId: userId,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// POST /api/projects/:id/files - Upload file
router.post('/:id/files', upload.single('file'), async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role || 'client';
    const { id: projectId } = req.params;
    const { label, milestoneId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = await canAccessProject(userId, projectId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Azure Blob Storage
    const uploadResult = await uploadFile(req.file, `projects/${projectId}`);

    // Save to database
    const [fileRecord] = await db.insert(files).values({
      projectId,
      milestoneId: milestoneId || null,
      uploadedByMemberId: userId,
      fileUrl: uploadResult.url,
      blobName: uploadResult.blobName,
      fileName: req.file.originalname,
      fileType: uploadResult.contentType,
      fileSize: uploadResult.size,
      label: label || null,
    }).returning();

    // Log activity
    await db.insert(activityLog).values({
      projectId,
      eventType: 'file_uploaded',
      description: `File "${req.file.originalname}" uploaded`,
      actorMemberId: userId,
    });

    res.status(201).json(fileRecord);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload file' });
  }
});

// DELETE /api/projects/:id/files/:fileId - Delete file
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role || 'client';
    const { id: projectId, fileId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = await canAccessProject(userId, projectId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get file record
    const [fileRecord] = await db.select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.projectId, projectId)));

    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Only uploader, admin, or PM can delete
    if (fileRecord.uploadedByMemberId !== userId && !['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ error: 'Cannot delete this file' });
    }

    // Delete from blob storage
    try {
      await deleteFile(fileRecord.blobName);
    } catch (err) {
      console.error('Failed to delete blob:', err);
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));

    // Log activity
    await db.insert(activityLog).values({
      projectId,
      eventType: 'file_deleted',
      description: `File "${fileRecord.fileName}" deleted`,
      actorMemberId: userId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// POST /api/projects/:id/messages - Send message
router.post('/:id/messages', async (req, res) => {
  try {
    const userId = req.session?.userId || req.user?.id;
    const userRole = req.session?.role || req.user?.role || 'client';
    const { id: projectId } = req.params;
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = await canAccessProject(userId, projectId, userRole);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const [newMessage] = await db.insert(messages).values({
      projectId,
      senderMemberId: userId,
      senderRole: userRole,
      message: message.trim(),
    }).returning();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
