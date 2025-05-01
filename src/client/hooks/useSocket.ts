/* eslint-disable no-console */
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export interface Profile {
  nickname: string;
  role: string;
  icon: string;
  favoriteCommands: string[];
}

export interface Command {
  emoji: string;
  text: string;
}

export interface SheetChange {
  sheetId: string;
  pageNumber?: number;
}

// Define a type for drawing paths
export interface DrawingPath {
  points: Array<{x: number; y: number}>;
  color: string;
  width: number;
  opacity?: number;
}

export interface DrawingData {
  sheetId: string;
  pageNumber: number;
  paths: DrawingPath[]; // Now using a specific type instead of any[]
}

export interface CommandEvent {
  command: Command;
  sender: Profile;
}

const useSocket = (options: UseSocketOptions = {}) => {
  const { url = window.location.origin, autoConnect = true } = options;

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket
  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(url);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, autoConnect]);

  // Register profile
  const register = useCallback((profile: Profile) => {
    if (!socketRef.current) return;
    socketRef.current.emit('register', profile);
  }, []);

  // Send sheet change
  const sendSheetChange = useCallback((data: SheetChange) => {
    if (!socketRef.current) return;
    socketRef.current.emit('sheet-change', data);
  }, []);

  // Send drawing update
  const sendDrawingUpdate = useCallback((data: DrawingData) => {
    if (!socketRef.current) return;
    socketRef.current.emit('drawing-update', data);
  }, []);

  // Send command
  const sendCommand = useCallback((command: Command) => {
    if (!socketRef.current) return;
    socketRef.current.emit('command', command);
  }, []);

  // Subscribe to events
  const subscribe = useCallback(<T>(event: string, callback: (data: T) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(event, callback);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    register,
    sendSheetChange,
    sendDrawingUpdate,
    sendCommand,
    subscribe
  };
};

export default useSocket;
