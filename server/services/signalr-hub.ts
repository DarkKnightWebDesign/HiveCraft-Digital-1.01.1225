import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Request } from 'express';

let io: SocketIOServer | null = null;

interface AuthenticatedSocket {
  userId: string;
  userRole: string;
  projectIds: string[];
}

const authenticatedSockets = new Map<string, AuthenticatedSocket>();

/**
 * Initialize Socket.IO for real-time messaging
 * @param httpServer - HTTP server instance
 */
export function initializeSignalR(httpServer: HttpServer): void {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on('authenticate', (data: { userId: string; userRole: string; projectIds?: string[] }) => {
      authenticatedSockets.set(socket.id, {
        userId: data.userId,
        userRole: data.userRole,
        projectIds: data.projectIds || [],
      });

      // Join user's personal room
      socket.join(`user:${data.userId}`);

      // Join project rooms
      if (data.projectIds) {
        data.projectIds.forEach(projectId => {
          socket.join(`project:${projectId}`);
        });
      }

      socket.emit('authenticated', { success: true });
      console.log(`Socket authenticated for user ${data.userId}`);
    });

    // Join a project room
    socket.on('join-project', (projectId: string) => {
      const auth = authenticatedSockets.get(socket.id);
      if (auth) {
        socket.join(`project:${projectId}`);
        if (!auth.projectIds.includes(projectId)) {
          auth.projectIds.push(projectId);
        }
        console.log(`User ${auth.userId} joined project ${projectId}`);
      }
    });

    // Leave a project room
    socket.on('leave-project', (projectId: string) => {
      const auth = authenticatedSockets.get(socket.id);
      if (auth) {
        socket.leave(`project:${projectId}`);
        auth.projectIds = auth.projectIds.filter(id => id !== projectId);
        console.log(`User ${auth.userId} left project ${projectId}`);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { projectId: string; userName: string }) => {
      const auth = authenticatedSockets.get(socket.id);
      if (auth) {
        socket.to(`project:${data.projectId}`).emit('user-typing', {
          userId: auth.userId,
          userName: data.userName,
          projectId: data.projectId,
        });
      }
    });

    // Handle stop typing
    socket.on('stop-typing', (data: { projectId: string }) => {
      const auth = authenticatedSockets.get(socket.id);
      if (auth) {
        socket.to(`project:${data.projectId}`).emit('user-stopped-typing', {
          userId: auth.userId,
          projectId: data.projectId,
        });
      }
    });

    socket.on('disconnect', () => {
      authenticatedSockets.delete(socket.id);
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

/**
 * Send a new message notification to project members
 */
export function notifyNewMessage(projectId: string, message: any): void {
  if (!io) return;

  io.to(`project:${projectId}`).emit('new-message', {
    projectId,
    message,
  });
}

/**
 * Notify project update to all members
 */
export function notifyProjectUpdate(projectId: string, update: any): void {
  if (!io) return;

  io.to(`project:${projectId}`).emit('project-updated', {
    projectId,
    update,
  });
}

/**
 * Notify milestone update to project members
 */
export function notifyMilestoneUpdate(projectId: string, milestone: any): void {
  if (!io) return;

  io.to(`project:${projectId}`).emit('milestone-updated', {
    projectId,
    milestone,
  });
}

/**
 * Notify file upload to project members
 */
export function notifyFileUpload(projectId: string, file: any): void {
  if (!io) return;

  io.to(`project:${projectId}`).emit('file-uploaded', {
    projectId,
    file,
  });
}

/**
 * Send notification to specific user
 */
export function notifyUser(userId: string, notification: any): void {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification', notification);
}

/**
 * Get Socket.IO instance
 */
export function getSocketIO(): SocketIOServer | null {
  return io;
}
