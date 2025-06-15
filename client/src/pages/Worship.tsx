import { useEffect, useRef } from 'react';

const Worship = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const handle = (e: PointerEvent) => {
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    canvas.addEventListener('pointerdown', e => {
      ctx.beginPath();
      ctx.moveTo((e as PointerEvent).offsetX, (e as PointerEvent).offsetY);
      canvas.addEventListener('pointermove', handle);
    });
    canvas.addEventListener('pointerup', () => {
      canvas.removeEventListener('pointermove', handle);
    });
  }, []);

  return (
    <div>
      <h2>예배 화면</h2>
      <canvas ref={canvasRef} width={500} height={500} style={{ border: '1px solid black' }} />
    </div>
  );
};

export default Worship;
