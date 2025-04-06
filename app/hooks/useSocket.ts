import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useProfileStore } from '../stores/useProfileStore';

export function useSocket(url: string) {
  const { profile } = useProfileStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!profile) return;

    socketRef.current = io(url, {
      query: {
        userId: profile.id,
        role: profile.role,
        name: profile.name,
      },
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url, profile]);

  return socketRef.current;
}
