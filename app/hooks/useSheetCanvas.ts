import * as fabric from 'fabric';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useProfileStore } from '../stores/useProfileStore';
import type { DrawingData } from '../types/worship';

interface UseSheetCanvasProps {
  socket: Socket | null;
  sheetId: string;
  isDrawMode?: boolean;
}

export function useSheetCanvas({ socket, sheetId, isDrawMode = false }: UseSheetCanvasProps) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLCanvasElement | null>(null);
  const { profile } = useProfileStore();
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = new fabric.Canvas(containerRef.current, {
      isDrawingMode: isDrawMode,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    canvasRef.current = canvas;

    canvas.on('path:created', ({ path }) => {
      if (!socket || !profile) return;

      const drawingData: DrawingData = {
        sheetId,
        paths: [path.toObject()],
        createdBy: profile.id,
        createdAt: new Date().toISOString(),
      };

      socket.emit('drawing:update', drawingData);
    });

    return () => {
      canvas.dispose();
    };
  }, [containerRef, socket, profile, sheetId, isDrawMode]);

  useEffect(() => {
    if (!socket) return;

    socket.on('drawing:receive', (data: DrawingData) => {
      if (!canvasRef.current || data.sheetId !== sheetId) return;

      data.paths.forEach((pathData) => {
        fabric.util.enlivenObjects([pathData], ([path]) => {
          canvasRef.current?.add(path);
        });
      });
    });

    return () => {
      socket.off('drawing:receive');
    };
  }, [socket, sheetId]);

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.isDrawingMode = isDrawMode;
  }, [isDrawMode]);

  return {
    containerRef,
    isDrawing,
  };
}
