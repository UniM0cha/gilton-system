import { useEffect, useRef } from 'react';
import CommandOverlay from '../components/CommandOverlay';

const Worship = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    wsRef.current = new WebSocket('ws://localhost:3000');
    wsRef.current.onmessage = ev => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'draw') {
          const { x, y } = data.payload;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      } catch {}
    };

    const handleMove = (e: PointerEvent) => {
      const payload = { x: e.offsetX, y: e.offsetY };
      ctx.lineTo(payload.x, payload.y);
      ctx.stroke();
      wsRef.current?.send(JSON.stringify({ type: 'draw', payload }));
    };

    canvas.addEventListener('pointerdown', e => {
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      canvas.addEventListener('pointermove', handleMove);
    });
    canvas.addEventListener('pointerup', () => {
      canvas.removeEventListener('pointermove', handleMove);
    });

    return () => {
      wsRef.current?.close();
    };
  }, []);

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">예배 화면</h2>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border border-black touch-none"
      />
      <CommandOverlay />
    </div>
  );
};

export default Worship;
