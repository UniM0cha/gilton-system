import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  ProfileDto as Profile, 
  CommandDto as Command, 
  SheetChangeDto as SheetChange,
  DrawingDataDto as DrawingData
} from '@shared/types/dtos';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

const useSocket = (options: UseSocketOptions = {}) => {
  // WebSocket 서버 URL
  // 직접 Electron 서버의 WebSocket 엔드포인트에 연결
  const defaultUrl = 'http://localhost:3001';

  const { url = defaultUrl, autoConnect = true } = options;

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
    subscribe,
  };
};

export default useSocket;
