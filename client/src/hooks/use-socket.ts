import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';

let socket: Socket | null = null;

interface SocketEvents {
  'new-message': (data: { projectId: string; message: any }) => void;
  'project-updated': (data: { projectId: string; update: any }) => void;
  'milestone-updated': (data: { projectId: string; milestone: any }) => void;
  'file-uploaded': (data: { projectId: string; file: any }) => void;
  'notification': (notification: any) => void;
  'user-typing': (data: { userId: string; userName: string; projectId: string }) => void;
  'user-stopped-typing': (data: { userId: string; projectId: string }) => void;
}

export function useSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection
    if (!socket) {
      const socketUrl = import.meta.env.VITE_API_URL || '';
      socket = io(socketUrl, {
        path: '/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);

        // Authenticate the socket connection
        socket?.emit('authenticate', {
          userId: user.id,
          userRole: user.role || 'client',
          projectIds: [], // Will be populated when joining projects
        });
      });

      socket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('user-typing', (data) => {
        setTypingUsers(prev => new Map(prev).set(data.projectId, data.userName));
      });

      socket.on('user-stopped-typing', (data) => {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(data.projectId);
          return next;
        });
      });
    }

    return () => {
      // Keep connection alive unless user logs out
    };
  }, [user]);

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K]
  ) => {
    if (!socket) return;
    socket.on(event, handler as any);
  }, []);

  const off = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K]
  ) => {
    if (!socket) return;
    socket.off(event, handler as any);
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (!socket) return;
    socket.emit(event, data);
  }, []);

  const joinProject = useCallback((projectId: string) => {
    if (!socket) return;
    socket.emit('join-project', projectId);
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    if (!socket) return;
    socket.emit('leave-project', projectId);
  }, []);

  const sendTyping = useCallback((projectId: string, userName: string) => {
    if (!socket) return;
    socket.emit('typing', { projectId, userName });
  }, []);

  const stopTyping = useCallback((projectId: string) => {
    if (!socket) return;
    socket.emit('stop-typing', { projectId });
  }, []);

  return {
    isConnected,
    on,
    off,
    emit,
    joinProject,
    leaveProject,
    sendTyping,
    stopTyping,
    typingUsers,
  };
}
